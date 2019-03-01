function onLoad() {

    doFHIR();

}


function doFHIR() {

    promiseMe()
	.then(function(ptData, ptAllergies) {

	    alert("got fhir data");


	});

    

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
	    
	    var patient = smart.patient;
	    var pt = patient.read();
	    
	    
	    var obv = smart.patient.api.fetchAll({
		type: 'Observation',
		query: {}
	    });


	    //if read() fails
	    $.when(pt, obv).fail(function(patient, observations) {
		deferred.reject("read() failed");
	    });
	    
	    //if read() succeeds, return the patient resource data
	    $.when(pt,obv).done(function(patient, observations) {
		deferred.resolve(patient, observations);
	    });

	} else 
	    deferred.resolve("Missing property patient");
    }

    //Hit FHIR API
    FHIR.oauth2.ready(onReady, onError);
    
    //return the created promise 
    return deferred.promise();
    
}
