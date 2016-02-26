var xml2js = require('xml2js');
var fs = require('fs');
var readline = require('readline-sync');
var jsonfile = require('jsonfile');

var parser = new xml2js.Parser();

if(process.argv.length == 3) {
	jsonfile.readFile(__dirname + '/addresses.json', function(err, addressesJson) {
		if(err) {
			addressesJson = {};
		}

		fs.readFile(process.argv[2], function(err, data) {
			if(err) throw err;

		    parser.parseString(data, function (err, backup) {
		    	if(err) throw err;

		    	var addresses = {};

		        backup.smses.sms.forEach((sms) => {
		        	if(addresses[sms.$.address]) {
		        		addresses[sms.$.address].total++;
		        		if(sms.$.type == 2) {
		        			addresses[sms.$.address].sended++;
		        		} else {
		        			addresses[sms.$.address].received++;
		        		}
		        	} else {
		        		addresses[sms.$.address] = {
		        			address: sms.$.address,
		        			total: 0,
		        			sended: 0,
		        			received: 0
		        		};

		        		addresses[sms.$.address].total++;
		        		if(sms.$.type == 2) {
		        			addresses[sms.$.address].sended++;
		        		} else {
		        			addresses[sms.$.address].received++;
		        		}
		        	}
		        });

		        var sorted_addresses = [];
		        for(var address in addresses) {
		        	addresses[address].psended = (addresses[address].sended / addresses[address].total * 100).toFixed(2);
		        	addresses[address].preceived = (addresses[address].received / addresses[address].total * 100).toFixed(2);

		        	sorted_addresses.push(addresses[address]);
		        }
		        sorted_addresses.sort((a, b) => {
		        	return b.total - a.total;
		        })

		        for (var i = 0; i < sorted_addresses.length && i < 10; i++) {
		        	var address = sorted_addresses[i];

		        	if(!addressesJson[address.address]) {
		        		addressesJson[address.address] = {
		        			address: address.address
		        		};
		        		addressesJson[address.address].name = readline.question('Who is ' + address.address + ' ? ');
		        	}
		        }
		        jsonfile.writeFile(__dirname + '/addresses.json', addressesJson);

		        console.log("\nTOP 10 ADDRESSES :\n");
		        for (var i = 0; i < sorted_addresses.length && i < 10; i++) {
		        	var address = sorted_addresses[i];
		        	
			        console.log("\n#" + (i + 1) + " - " + addressesJson[address.address].name + ": " + address.total + " messages");
			        	console.log(address.sended + " sended (" + address.psended + "%), " + address.received + " received (" + address.preceived + "%)");
		    	}
		    });
		});
	});
} else {
	console.log("Usage: node index <Backup file>");
}