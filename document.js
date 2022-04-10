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


const app = new Vue({
	el,
	data,
	methods:{
		searchSubmit(){
			this.search(this.text);
		},
		search(text,index = 0,cb=_=>{}){
			if(!text){
				this.index = 0;
				this.images = [];
				const title = '百度图片搜索极简版';
				document.title = title;

				const GET = getQuerys();
				if(GET.text || GET.index) history.pushState({}, title, './');
				return;
			}
			this.runing = true;

			const uri = `${baseAPIURL}baidu/images?text=${encodeURIComponent(text)}&index=${index}`;

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
				history.pushState({}, title, uri);
				cb();
			});
		},
		pullImages(){
			const images = this.images;
			const el = this.$refs['el'];
			const offsetWidth = el.offsetWidth;
			const imageExpectWidth = 240;
			let col = Math.floor(offsetWidth/imageExpectWidth);

			if( 310 < offsetWidth && offsetWidth < 420){
				col = 2;
			}

			const margin = 4;
			const imageWidth = Math.round( (offsetWidth - margin) / col - margin );

			const cols = [];
			for(let i = 0;i<col;i++){
				cols[i] = margin;
			}

			const getMinCol = _=>{
				const v = Math.min.apply(Math,cols)
				return cols.indexOf(v);
			}

			images.forEach(image=>{
				let _height = Math.round(imageWidth / image.width * image.height);
				const index = getMinCol();

				const _left = index * (imageWidth + margin) + margin;
				const _top = cols[index];

				cols[index] += _height + margin;

				if(!this.simple){
					cols[index] += 38;
				}


				this.$set(image,'_width',imageWidth)
				this.$set(image,'_height',_height)
				this.$set(image,'_left',_left)
				this.$set(image,'_top',_top)
			});

			const imagesHeight = Math.max.apply(Math,cols)
			app.imagesHeight = imagesHeight;

		},
		prev(){
			this.search(this.text,this.index - 30,_=>scrollTo(0,0));
		},
		next(){
			this.search(this.text,this.index + this.images.length,_=>scrollTo(0,0));
		},
		onload(image){
			// image.loaded = true
			this.$set(image,'loaded',true)
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
	app.search(text,index);
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