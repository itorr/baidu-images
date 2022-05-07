import axios from 'axios'


const searchFetch = async (text,size=30,index=0) => {
	const uri = `https://m.baidu.com/sf/vsearch/image/search/wisesearchresult?word=${encodeURIComponent(text)}&pn=${index}&rn=${size}`

	try{
		const r = await axios.get(uri,{
			responseType: 'json'
		});
		const data = r.data.linkData.map(p => {
			return {
				src: p.thumbnailUrl,
				ori: p.objurl,
				url: p.fromUrl,
				title: p.oriTitle,
				width: p.width,
				height: p.height,
				hex: p.shituToken
			}
		});
		return data;
	}catch(e){
		return [];
	}
};

export default async function handler(req, res) {
    const query = req.query;
    let { size, index, text } = query;

    size = Number(size) || 30
    index = Number(index) || 0

    // {
    //     body: request.body,
    //     query: request.query,
    //     cookies: request.cookies,
    // }

    res.status(200).json(searchFetch(text.size,index));
}