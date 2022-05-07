import axios from 'axios'


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

    res.status(200).json({
        axios
    });
}