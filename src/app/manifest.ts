import type {MetadataRoute} from 'next';
export default function manifest():MetadataRoute.Manifest{return {name:'BASS BIN MUSIC',short_name:'BASS BIN',description:'Free-first phonk music visualizer studio',start_url:'/',display:'standalone',background_color:'#070911',theme_color:'#080a17',icons:[{src:'/bass-bin-logo.png',sizes:'any',type:'image/png'}]};}
