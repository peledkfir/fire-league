
var opts = [{
	id: 'jive',
	fb: '622249227842681',
	url: 'https://jive.firebaseio.com',
	fb_secret: 'Z3EvVzjzEQJglA7sftvVmfr6r8FMOzXH1LywKmTr'
}, {
	id: 'test',
	fb: '1428543527386749',
	url: 'https://myproleague.firebaseio.com',
	fb_secret: '78pcH8rHUAbbGVxdxD3dNCDj22QzliierUoTbO3f'
}, {
	id: 'demo',
	fb: '565184526930339',
	url: 'https://fireleague.firebaseio.com',
	fb_secret: '93yOfA7fRZr3sZBaR1sQRQVTZ2jN3qAXGCrZNrQp'
}];

var cloudinary = { 'api_key': '763544281915715', 'secret': 'qYP8WLImGdrz-VZyNywMWvvm4UY', 'cloud_name': 'dorhjzvuc' };

module.exports = {
	ENVIRONMENTS: opts,

	CLDNRY_API: cloudinary.api_key,
	CLDNRY_SECRET: cloudinary.secret,
	CLDNRY_NAME: cloudinary.cloud_name
};