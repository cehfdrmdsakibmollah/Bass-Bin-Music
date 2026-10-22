import type { AssetEntry, StudioProject } from './types';
import { normalizeProject } from './project';
const DATABASE='bass-bin-music-v1';
function db():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open(DATABASE,1);
    request.onupgradeneeded=()=>{
      const conn=request.result;
      if(!conn.objectStoreNames.contains('projects')) conn.createObjectStore('projects',{keyPath:'id'});
      if(!conn.objectStoreNames.contains('assets')) conn.createObjectStore('assets',{keyPath:'id'});
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error);
  });
}
async function run<T>(store:'projects'|'assets',mode:IDBTransactionMode,fn:(s:IDBObjectStore)=>IDBRequest<T>):Promise<T>{
  const conn=await db();
  return new Promise<T>((resolve,reject)=>{
    const tx=conn.transaction(store,mode), req=fn(tx.objectStore(store));
    let value:T;
    req.onsuccess=()=>{value=req.result};
    tx.oncomplete=()=>{conn.close();resolve(value)};
    tx.onerror=()=>{conn.close();reject(tx.error)};
    tx.onabort=()=>{conn.close();reject(tx.error)};
  });
}
export async function saveProject(project:StudioProject){await run('projects','readwrite',s=>s.put(project));}
export async function loadProject(id:string):Promise<StudioProject|null>{const record=await run<StudioProject|undefined>('projects','readonly',s=>s.get(id));return normalizeProject(record);}
export async function listProjects():Promise<StudioProject[]>{const items=await run<StudioProject[]>('projects','readonly',s=>s.getAll());return items.filter(p=>normalizeProject(p)).sort((a,b)=>b.updatedAt-a.updatedAt);}
export async function saveAsset(asset:AssetEntry){await run('assets','readwrite',s=>s.put(asset));}
export async function loadAsset(id:string):Promise<AssetEntry|undefined>{return run('assets','readonly',s=>s.get(id));}
export async function removeProject(id:string){await run('projects','readwrite',s=>s.delete(id));}
