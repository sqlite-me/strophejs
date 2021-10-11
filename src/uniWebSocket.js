let sCount=0,rCount=0;
/* Uni App 
*/
let uniWebSocket = undefined
try{
    class _uniWebSocket extends uni.connectSocket{
        constructor(service,protocol){
            //console.log('__app private  2',service,protocol)
            super({
                url: service,
                header: {'content-type': 'application/json'},
                protocols: protocol,//['xmpp'],
                method: 'GET',
                complete: (data)=> {
                    //console.log("__app Connection complete 2:",data);
                },//需要至少传入 success / fail / complete 参数中的一个
                success:function(data){
                    //console.log("__app Connection success:",data);
                },
                fail:function(err){
                    //console.log("__app Connection fail:",err);
                }
            });
                
            let me=this;
                
            me.onOpen(function (res) {
                //console.log('__app onOpen', res);
                if(me.onopen)
                    me.onopen(res);
            });
                
            me.onClose(function(e){
                if(me.onclose)
                    me.onclose(e);
                //console.log('__app onClose',e);
            });
            me.onError(function(e){
                if(me.onerror)
                    me.onerror(e);
                //console.error('__app onError',e);
            });
                
            me.onMessage(function (res) {
                //console.log('__app onMessage '+(++rCount),res.data);
                if(me.onmessage)
                    me.onmessage(res);
            });

            const baseSend=me.send;
            me.send=function(data){
                //console.log('__app sned '+(++sCount),data)
                //if(sCount==2) throw new Error('Test');
                baseSend.call(me,{data:data});
            }
        }
    }

    uniWebSocket=_uniWebSocket;
}catch(e){
    console.log(e);
}

export { uniWebSocket };