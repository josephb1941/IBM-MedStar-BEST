function onLoad() {

    doFHIR();

}


function doFHIR() {

    promiseMe()
	.then(function(ptData, ptImmun) {

	    addDemographics(ptData);

	    addImmunizations(ptImmun);

	});
}


function addDemographics(patient) {

    document.getElementById("pSex").innerHTML += patient.gender;

    var fname = '';
    var lname = '';

    if (typeof patient.name[0] !== 'undefined') {
    	fname = patient.name[0].given.join(' ');
    	lname = patient.name[0].family.join(' ');
    }

    
    document.getElementById("pName").innerHTML += lname + ', ' + fname;
    

}


function  addImmunizations(immunizations) {

    // var numImmuns = immunizations.length;

    var root = document.getElementById("ulImmuns");

    _.each(immunizations, function(immunization) {

	root.appendChild(createListItem(immunization));

    });
    
}

function createListItem(immunization) {

    var elem = document.createElement("LI");

    var vaccine = immunization.vaccineCode.text;

    var givenDtTm = moment(immunization.date).format("M/D/YYYY @ h:m:sa");
    
    var textNode = document.createTextNode(vaccine + " - Given on: " + givenDtTm);
    
    elem.className = 'immuns';

    elem.appendChild(textNode);

    return elem;
    
}

function promiseMe() {
 
    var deferred = $.Deferred();

    //If the API call fails
    function onError() {

	deferred.reject("It didn't work");

    }

    //If FHIR call was successful 
    function onReady(smart)  {
	
	if (smart.hasOwnProperty('patient')) {

	    //Fetch FHIR data
	    var patient = smart.patient;
	    var pt = patient.read();
	    
	    //Get immunization records
	    var obv = smart.patient.api.fetchAll({
		type: 'Immunization',
		query: {}
	    });


	    //if read() fails
	    $.when(pt, obv).fail(function(patient, immunizations) {
		deferred.reject("read() failed");
	    });
	    
	    //if read() succeeds, return the patient resource data
	    $.when(pt,obv).done(function(patient, immunizations) {
		deferred.resolve(patient, immunizations);
	    });

	} else 
	    deferred.resolve("Missing property patient");
    }

    //Hit FHIR API
    FHIR.oauth2.ready(onReady, onError);
    
    //return the created promise 
    return deferred.promise();
    
}
