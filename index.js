var express=require("express");
var app=express();
var https= require("https");


//open at http://52.68.7.30/

//making all files in directory ./static publically accessable
app.use(express.static(__dirname + '/static'));

//api path
app.get("/issues",function(req,resp,next){

//getting repo url from querystring
	var url= req.query["url"] || "";
	//regex to verify if its a repo url
	var mat=url.match(/https?:\/\/([^\.]+\.)?github\.com\/([^\/]+\/[^\/]+)/)
	//if doesnot match, send error
	if(!mat) return resp.status(403).send("not a repo url");

//api end point
	api_ = "/search/issues?q=repo:"+mat[2]+'+is:open+is:issue'
	time_24hrsback=(new Date((new Date()).getTime()-24*60*60*1000)).toISOString();
  	time_7daysback=(new Date((new Date()).getTime()-7*24*60*60*1000)).toISOString();

//preparing output data
  	outp={ t24h:-1, t24h_7d: -1, t7d:-1};

   
  	//getting data for past 24 hrs
	r=https.request(opts(api_+"+created:>="+time_24hrsback), function(res) {
		 var body = '';
		  res.on('data', function(chunk) {
		    body += chunk;
		  });
		  res.on('end', function() {

		  	outp.t24h=JSON.parse(body).total_count;
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
		  	send(resp);
		  });
	})
	r.end();
	r.on('error', function(e) {
	  console.log("Got error: " + e.message);
	});


//check if all 3 data are available, if yes, send response. otherwise, do nothing
function send(res){
if(outp.t7d>-1 && outp.t24h>-1 && outp.t24h_7d>-1 )
	res.json(outp);
}

//returns generic get request parameters combined with api endpoint
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

//start app at port 80
app.listen(80);