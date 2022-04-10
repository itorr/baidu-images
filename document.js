const request = (method,uri,data,callback)=>{
	let body = null;
	if(data){
		body = JSON.stringify(data);
	}
	fetch(uri,{
		method,
		mode: 'cors',
		body,
		credentials: 'include',
		headers: {
			'content-type': 'application/json'
		}
	}).then(res => res.json()).then(data => callback(data)).catch(error => console.error(error))
};

const getQuerys = _=>{
	const GET = {};
	let queryString = location.search.slice(1);
	if(queryString){
		let gets = queryString.split(/&/g);
		gets.forEach(get=>{
			let [k,v] = get.split(/=/);
			GET[decodeURIComponent(k)] = decodeURIComponent(v);
		})
	};
	return GET
};

const deepCopy = o=>JSON.parse(JSON.stringify(o));
let images = [];
const data = {
	text:'',
	images,
	index:0,
	runing:false,
	simple:true,
	animation:false,
	imagesHeight:0
};

const hostName = location.hostname;
let baseAPIURL = `http://${hostName}:60912/api/`;
if(/magiconch/.test(hostName)) baseAPIURL = `//lab.magiconch.com/api/`;

const size = 30;

const app = new Vue({
	el,
	data,
	methods:{
		searchSubmit(){
			this.search(this.text);
		},
		search(text,index = 0,isPop = true,cb=_=>{}){
			if(!text){
				this.index = 0;
				this.images = [];
				const title = '百度图片搜索极简版';
				document.title = title;

				const GET = getQuerys();
				if(isPop || GET.text || GET.index) history.pushState({}, title, './');
				return;
			}
			this.runing = true;

			const uri = `${baseAPIURL}baidu/images?text=${encodeURIComponent(text)}&index=${index}&size=${size}`;

			request('get',uri,null,r=>{
				this.runing = false;
				this.index = index;
				this.images = r;

				this.pullImages();

				let uri = `./?text=${encodeURIComponent(text)}`;
				let title = `${text}`;

				if(index){
					uri += `&index=${encodeURIComponent(index)}`;
					title += ` - ${index}`;
				}

				document.title = title;
				if(isPop) history.pushState({}, title, uri);
				cb();
			});
		},
		pullImages(){
			const images = this.images;
			const el = this.$refs['el'];
			const offsetWidth = el.offsetWidth;
			const imageExpectWidth = 240;
			let col = Math.floor(offsetWidth/imageExpectWidth);

			const isMobile = 310 < offsetWidth && offsetWidth < 720;


			const margin = 4;
			let imageWidth = Math.floor( (offsetWidth - margin) / col - margin );
			// const imageWidth = Math.floor( offsetWidth / col  - margin);

			
			if( isMobile ){
				col = 2;
				imageWidth = Math.floor( (offsetWidth - margin) / col );
			}

			const cols = new Array(col);
			cols.fill(margin);

			const getMinCol = _=> cols.indexOf(Math.min.apply(Math,cols))

			images.forEach(image=>{
				let _height = Math.round(imageWidth / image.width * image.height);
				const index = getMinCol();

				let _left = index * (imageWidth + margin) + margin;
				let _top = cols[index];

				if(col === 2){
					_left = index % 2 === 0 ? 0 : offsetWidth - imageWidth;
				}

				cols[index] += _height + margin;

				if(!this.simple){
					cols[index] += 38;
				}


				this.$set(image,'_width',imageWidth)
				this.$set(image,'_height',_height)
				this.$set(image,'_left',_left)
				this.$set(image,'_top',_top)
			});

			app.imagesHeight = Math.max.apply(Math,cols)

		},
		prev(){
			this.search(this.text,this.index - size,true,_=>scrollTo(0,0));
		},
		next(){
			this.search(this.text,this.index + size,true,_=>scrollTo(0,0));
		}
	},
	watch:{
		text(val){
			this.index = 0;
		},
		simple(){
			this.pullImages();
		}
	}
})

onpopstate = _=>{
	const GET = getQuerys();
	const text = GET.text || '';
	const index = +GET.index || 0;
	app.text = text;
	app.search(text,index,false);
}
onpopstate();

onresize = _=>{
	clearTimeout(app.T);
	app.T = setTimeout(app.pullImages,400);
};

const loadScript = (src,el) =>{
	el = document.createElement('script');
	el.src = src;
	document.body.appendChild(el);
};

window._hmt = [];
window.dataLayer = [
    ['js', new Date()],
    ['config', 'G-13BQC1VDD8']
];
window.gtag = function(){dataLayer.push(arguments)};
setTimeout(_=>{
	loadScript('//hm.baidu.com/hm.js?f4e477c61adf5c145ce938a05611d5f0');
	loadScript('//www.googletagmanager.com/gtag/js?id=G-13BQC1VDD8');
},400);