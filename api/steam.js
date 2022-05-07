import axios from 'axios'

const apiKey = '45696DEC3D074506B7203C0CA93E4CB1';


const timeout = 4000;

const get = async uri =>{
	try{
		const res = await axios.get(uri,{
			timeout,
			responseType:'text',
			headers:{
				'user-agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36',
				'referer':uri,
				'Accept-Language': 'zh-CN,zh;q=0.9'
			}
		});
		let data = res.data;
		try{
			data = JSON.parse(data);
		}catch(e){

		}
		// if(typeof data === 'object'){
			
		// }
		return data;
	}catch(e){
		console.log(/gete/,e);
		return null;
	}
}



const id64Regex = /7656[0-9]{12,14}/g;

const steamAPIBaseURL = 'https://api.steampowered.com/';



const getUsersBySteam = async id64s => {
    id64s = [...new Set(id64s)];
	const Users = {};
	try{
		const id64sString = id64s.join(',');
		const uri = `${steamAPIBaseURL}ISteamUser/GetPlayerSummaries/v2/?key=${apiKey}&steamids=${id64sString}`;
		const res = await get(uri);
		const summaries = res.response.players;
		const bansId64s = [];
		let index = summaries.length;
		while(index--){
			const summarie = summaries[index];

			const id64 = summarie.steamid;
			const user = {
				id64,
				personaname: summarie.personaname,
				avatar: summarie.avatarmedium,
				timecreated: summarie.timecreated || null,
			};
			Users[id64] = user;
			bansId64s.push(id64);
		};

		if(bansId64s.length){
			const uri = `${steamAPIBaseURL}ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${bansId64s.join(',')}`;
			const res = await get(uri);
			const playerBans = res.players;

			if(playerBans){
				let index = playerBans.length;
				while(index--){
					const bans = playerBans[index];
					const id64 = bans.SteamId;
					delete bans.SteamId;
					if(!Users[id64]) Users[id64] = {id64};
					for(let key in bans){
						if(!bans[key] || bans[key] === "none"){
							delete bans[key];
						}
					}
					Users[id64].bans = bans;
				};
			}
		}
		return Object.values(Users);
	}catch(e){
		console.log(/e getUsersBySteam/,e);
		return [];
	}
};
const GetUserRecentlyPlayed = async id64 =>{
	const uri = `${steamAPIBaseURL}IPlayerService/GetRecentlyPlayedGames/v1/?key=${apiKey}&steamid=${id64}`;
	try{
		const r = await get(uri);
		const games = r.response['games'];
		if(!games) return null;

		const Games = {};
		games.forEach(game => {
			Games[game.appid] = game;
		});
		const game = Games[730];
		return game;
	}catch(e){
		console.log(/获取game time出错/,e,id64,uri);
		return null;
	}
};
const getUserLevel = async id64 =>{
	const uri = `${steamAPIBaseURL}IPlayerService/GetSteamLevel/v1/?key=${apiKey}&steamid=${id64}`;
	try{
		const r = await get(uri);
		return r.response['player_level'];
	}catch(e){
		console.log(/获取level出错/,e,id64,uri);
		return null;
	}
};
const getUsersDetailCallback = async (id64s,callback) =>{
	const users = await getUsersBySteam(id64s);

	let length = users.length;
	let index = users.length;

	let gamei = 0;
	let leveli = 0;
	const cb = _=>{
		if( gamei === length && leveli === length){
			users.forEach(user=>{
				const id64 = user.id64;
			});
			callback(users);
		}
	};
	while(index--){
		const user = users[index];
		const id64 = user.id64;
		if(user.timecreated && !user.detail){
			GetUserRecentlyPlayed(id64).then(game=>{
				if(game){
					user.csgo_playtime_2weeks = game.playtime_2weeks;
					user.csgo_playtime_forever = game.playtime_forever;
				}
				gamei++;
				cb();
			});
			getUserLevel(id64).then(level=>{
				user.level = level;
				leveli++;
				cb();
			})
			user.detail = 1;
		}
	};
};
//76561198374544929
export default async function handler(req, res) {
    const query = req.query;

	const id64sQueryString = query['id64s'];
	if(!id64sQueryString) return res.status(200).json([]);

	const id64s = id64sQueryString.match(id64Regex);

    getUsersDetailCallback(id64s,users=>{
        res.status(200).json(users);
    })
}