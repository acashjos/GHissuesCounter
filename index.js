var express=require("express");
var app=express();
var https= require("https");


//making all files static
app.use(express.static(__dirname + '/static'));

//api path
app.get("/issues",function(req,resp,next){

//resp.send("dd")
	var url= req.query["url"] || "";
	var mat=url.match(/https?:\/\/([^\.]+\.)?github\.com\/([^\/]+\/[^\/]+)/)
	if(!mat) return resp.status(403).send("not a repo url");

	api_ = "/search/issues?q=repo:"+mat[2]+'+is:open+is:issue'
	time_24hrsback=(new Date((new Date()).getTime()-24*60*60*1000)).toISOString();
  	time_7daysback=(new Date((new Date()).getTime()-7*24*60*60*1000)).toISOString();


  	outp={ t24h:-1, t24h_7d: -1, t7d:-1};

   
  	//getting data for past 24 hrs
	r=https.request(opts(api_+"+created:>="+time_24hrsback), function(res) {
		 var body = '';
		  res.on('data', function(chunk) {
		    body += chunk;
		  });
		  res.on('end', function() {

		  	outp.t24h=JSON.parse(body).total_count;
		  	//console.log("24")
		  	send(resp);
		  });
	})
	r.end();
	r.on('error', function(e) {
	  console.log("Got error: " + e.message);
	});


  	//getting data for past 24 hrs - 7 days
	r=https.request(opts(api_+'+created:'+time_7daysback+'..'+time_24hrsback), function(res) {
		 var body = '';
		  res.on('data', function(chunk) {
		    body += chunk;
		  });
		  res.on('end', function() {

		  	outp.t24h_7d=JSON.parse(body).total_count;
		  	//console.log("24-7")
		  	send(resp);
		  });
	})
	r.end();
	r.on('error', function(e) {
	  console.log("Got error: " + e.message);
	});



  	//getting data before 7 days
	r=https.request(opts(api_+"+created:<="+time_7daysback), function(res) {
		 var body = '';
		  res.on('data', function(chunk) {
		    body += chunk;
		  });
		  res.on('end', function() {

		  	outp.t7d=JSON.parse(body).total_count;
		  	//console.log("7")
		  	send(resp);
		  });
	})
	r.end();
	r.on('error', function(e) {
	  console.log("Got error: " + e.message);
	});


//check if all 3 data are available, if yes, send response
function send(res){
if(outp.t7d>-1 && outp.t24h>-1 && outp.t24h_7d>-1 )
	res.json(outp);
}

function opts(path){

var options = {
	host: "api.github.com",
    path: path,
    method: 'GET',
    headers: {
        'User-Agent': 'acashjos',
    }
};
return options
}
});

app.listen(80);