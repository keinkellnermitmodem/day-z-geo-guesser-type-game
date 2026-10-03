// Uncompressed ZIP writer: local, dependency-free exports of an image + metadata.
export async function zip(entries){
 const enc=new TextEncoder(),parts=[],central=[];let offset=0,cdSize=0;
 const crc=bytes=>{let n=0xffffffff;for(const b of bytes){n^=b;for(let i=0;i<8;i++)n=n&1?(n>>>1)^0xedb88320:n>>>1;}return (n^0xffffffff)>>>0;};
 for(const [name,value] of entries){const data=new Uint8Array(await new Blob([value]).arrayBuffer()),filename=enc.encode(name),sum=crc(data),header=new Uint8Array(30+filename.length),v=new DataView(header.buffer);
  v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint32(14,sum,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,filename.length,true);header.set(filename,30);parts.push(header,data);
  const c=new Uint8Array(46+filename.length),d=new DataView(c.buffer);d.setUint32(0,0x02014b50,true);d.setUint16(4,20,true);d.setUint16(6,20,true);d.setUint16(8,0x800,true);d.setUint32(16,sum,true);d.setUint32(20,data.length,true);d.setUint32(24,data.length,true);d.setUint16(28,filename.length,true);d.setUint32(42,offset,true);c.set(filename,46);central.push(c);cdSize+=c.length;offset+=header.length+data.length;
 }
 const end=new Uint8Array(22),v=new DataView(end.buffer);v.setUint32(0,0x06054b50,true);v.setUint16(8,entries.length,true);v.setUint16(10,entries.length,true);v.setUint32(12,cdSize,true);v.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/zip'});
}
