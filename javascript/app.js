/*
 * @author jinyachen@gmail.com
 * H5 Slide Engine
 *
 */
document.addEventListener('touchmove', function (event) {
event.preventDefault();
}, false);

var TURN_SPEED = 500;
var SCENE_DEPTH = 100;
var App = function(){};
App.prototype= {
    window: {
        height: 0,
        width: 0,
    },

    //auto slice
    auto: false,

    touchSensitive: true,
    touchScrollStep: 12,
    touchDirection: 0,
   
    //now scene num
    currentSceneNo: 0,
    prevSceneNo: 0,
    nextSceneNo: 0,
    //scene zindex base
    currentSceneDepth: 0,
    //can swipe (no use)
    swipeable: true,
    //scene data
    sceneDatas:[],
    //scene count
    sceneCount: 0,
    scenes: null,
    //scene DOMs
    sceneDOMs:null,
    sceneMaxDepth : 0,

    //scene done
    sceneDones: {},
    sceneProcess: false,
    //scene action list
    sceneActions: [],

    //now exec action 
    execAction: null,
    //animation str
    animationEnd: 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
    //demo
    action:{
        run: function(){},
        next: function(){},
        prev: function(){},
    },
    //load resource(image)
    /*
     * @resource {Array}
     * @procFn {Function} load one function
     * @fn      {Function} done function
     */
    loading: function(resource, procFn, fn){
        var map = {};
        var resourceIndex = 0;
        var resourceCount = 0;
        var needLoadResource = [];
        var noLoadResource = [];
        if(resource){
            needLoadResource = resource['preload'] ? resource['preload'] : [];
            noLoadResource = resource['noload'] ? resource['noload'] : [];
        }
        var resource = needLoadResource;
        var loadingResource = $("[pre-src]");
        loadingResource.each(function(index,that){
            var item = $(that);
            resource.push(item.attr("pre-src"));
        });
        console.log('loading');
        for(var i in noLoadResource){
            var url = noLoadResource[i];
            var it = needLoadResource.indexOf(url);
           // console.log(url,it);
            if(-1 == it) {
                continue;
            } else {
                needLoadResource.splice(it, 1);
            }
        }
        setTimeout(function(){
            if(resource.length == 0){
                procFn && procFn(0, 0);
                fn && fn();
                return true;
            }
            for(var i in resource){
                var item = resource[i];
                map[i] = {
                    status: 0,
                };
                resourceCount ++;

                var op = {
                    type: 'image',
                    src: '',
                }
                if(typeof item == "string"){
                    op.src = item;
                } else {
                    op = item;
                }

                op.type = op.type? op.type : 'image';
                if(op.type == 'image'){
                    var img = new Image();
                    img.src = op.src;
                    img.onload= (function(_i, _img){
                       
                        return function(e){
                            //console.log(arguments)
                             resourceIndex ++;
                            //console.log(resourceIndex, resourceCount);
                            procFn && procFn(resourceIndex, resourceCount);
                            map[_i].status= 1;

                            var done = false;
                            for(var mpi in map){
                                if(map[mpi].status == 0) {
                                    return true
                                }
                            }
                            loadingResource.each(function(index,that){
                                var item = $(that);
                                item.attr("src", item.attr("pre-src"))
                            });
                          
                            //load done
                            console.log('Resource load done');
                            fn && fn();
                        }
                    })(i,img)
                }
            }
        },1);
        
        
    },
    /*
     * init window data
     */
    initWindow: function(){
        this.window.height = $(window).height();
        this.window.width = $(window).width();
    },
    /*
     * init
     */
    init: function(){
        //this.touchmove();
        var self = this;
        this.initWindow();
        this.sceneDOMs = $(".scene");
        this.sceneCount = this.sceneActions.length;
        this.currentSceneNo = 0;
        var self = this;
        $("body").css({
            height: this.window.height,
        });

        this.sceneDOMs.each(function(index,dom){
            $(dom).css({
                transform: "translateY(" + self.window.height + "px)",
                zIndex: index * SCENE_DEPTH,
                visibility: 'visible'
            }).attr("scene-no", index);

            if(!self.sceneDatas[index]){
                self.sceneDatas[index] = {};
            }
            self.sceneDatas[index]["depth"] = index * SCENE_DEPTH;
            self.sceneMaxDepth = self.sceneDatas[index]["depth"];
        });

        for(var i in this.sceneActions){
            this.sceneDones[i] = false;
        }



       this.first();
    },
    loop: function(sceneNum){
        var self = this;
        
        sceneNum = undefined !== sceneNum ? sceneNum : this.currentSceneNo;
        if(sceneNum >= this.sceneCount || sceneNum < 0 ){
            return;
        }
        console.log('loop',sceneNum)
        
      
        this.currentSceneNo = sceneNum;
        this.currentSceneDepth = this.sceneDatas[sceneNum]["depth"];
        this.execAction = this.sceneActions[this.currentSceneNo];
        this.unbindEvent();
        this.execAction.init && this.execAction.init();
        this.execAction.run && this.execAction.run();
        this.sceneDones[sceneNum] = true;
        if(this.auto){
            setTimeout(function(){
                self.next();
            }, this.auto);
        }
    },
    addAction: function(action){
        //console.log(arguments);
        this.sceneActions.push( action);
           
    },
    enableSwipe: function(){
        this.swipeable = true;
        this.bindEvent();
    },
    disableSwipe: function(){
        this.swipeable = false;
        $(window)
        .off("swipeUp")
        .off("swipeDown");
    },
    first: function(){
        this.sceneDOMs.eq(this.currentSceneNo).show().css({
            transform: "translateY(0)",
            visibility: 'visible',
            opacity: 1,
        });
        this.loop();
        this.done();
    },
    unbindEvent: function(){
        $(window)
        .off("swipeUp")
        .off("swipeDown")
        .off("touchstart")
        .off("touchend")
        .off("touchmove");
    },
    bindEvent: function(){
        var self = this;
        console.warn("bindEvent")
        $(window)
        .one("swipeUp", function(e){
            if(self.swipeable){
                if(self.currentSceneNo < self.sceneCount - 1){
                    self.next();
                }
            } 
        })
        .one("swipeDown", function(e){
            if(self.swipeable) {
                if(self.currentSceneNo > 0){
                    self.prev();
                }
               
            }
        });
       
        var sensitiveDegree = 20;
        var scrollTop = 0;
        var scrollStep = this.touchScrollStep;
        var touchStart = 0;
        var deltaStep = 30;
        var deltaStepLength = 0;
        var nextSceneNo = 0;
        var endOnce = false;

        $(window).on("touchstart", function(e){
            scrollTop = 0;
            touchStart = e.changedTouches[0].clientY;
        }).on("touchend", function(e){
            //console.warn("touchend")
            if(deltaStep > 30){
                // if(endOnce == false && self.swipeable) {
                //     self.prev();
                //     endOnce = true;
                // }
            } else if( deltaStep < -30 ) {
                // if(endOnce == false && self.swipeable) {
                //     self.next();
                //     endOnce = true;
                // }
            } else {
                if(self.touchSensitive && self.sceneDOMs.eq(self.currentSceneNo).attr("touch-sensitive") !== undefined ){
                    self.sceneDOMs.eq(self.currentSceneNo).animate({
                        translateY: 0,
                    });
                    console.log("next",nextSceneNo, self.window.height,deltaStep)
                    var nextNo = self.currentSceneNo + 1;
                    var prevNo = self.currentSceneNo - 1;
                    // console.log("next",self.sceneDOMs.filter("[scene-no='" + nextSceneNo + "']"))
                    self.sceneDOMs.filter("[scene-no='" + nextNo + "']").animate({
                        translateY: self.window.height + "px",
                    });
                    self.sceneDOMs.filter("[scene-no='" + prevNo + "']").animate({
                        translateY: - self.sceneDOMs.filter("[scene-no='" + (self.currentSceneNo - 1) + "']").height() + "px",
                    });
                }
            }

            return true;
       }).on("touchmove", function(e){
            deltaStep = e.changedTouches[0].clientY - touchStart;
            deltaStepLength = Math.abs(deltaStep);
            if(deltaStepLength < sensitiveDegree){
                return false;
            }
            var item = self.sceneDOMs.eq(self.currentSceneNo);
            //console.log(item)
            var sceneNo = parseInt(item.attr("scene-no"));
            if(self.touchSensitive && item.attr("touch-sensitive") !== undefined ){
                if(deltaStep < 0){
                    if(sceneNo >= self.sceneCount -1){
                        return;
                    }
                    scrollTop -= scrollStep;
                    if(sceneNo < self.sceneCount - 1 ){
                        nextSceneNo = sceneNo +1;
                        self.sceneDOMs.filter("[scene-no='" + nextSceneNo + "']").css({
                            transform: "translateY(" + ( scrollTop + item.height()) + "px" + ")",
                        });
                    }
                } else {
                    if(sceneNo <= 0){
                        return;
                    }
                    scrollTop += scrollStep;
                    if(sceneNo >0){
                        nextSceneNo = sceneNo - 1;
                        self.sceneDOMs.filter("[scene-no='" + nextSceneNo + "']").css({
                            transform: "translateY(" + ( scrollTop - self.sceneDOMs.filter("[scene-no='" + nextSceneNo + "']").height()) + "px" + ")",
                        });
                    }
                }
                item.css({
                    transform: "translateY(" + scrollTop + "px" + ")",
                });
            }
            
        });

    },
    done: function(sceneNum){
        this.bindEvent();
        this.sceneProcess = true;
        this.execAction.done && this.execAction.done();
    },
    next: function(sceneNum,force){
        var self = this;
        if(this.currentSceneNo > sceneNum) {
            return this.prev(sceneNum,force);
        }
        // this.sceneDOMs.eq(this.currentSceneNo).one(this.currentSceneNo, function(){
        //     $(this).hide();
        // });
        if( true == force){
            this.scrollNext(sceneNum);
        } else if(this.execAction.next && typeof this.execAction.next == 'function'){
            this.execAction.next(function(){
                self.loop(sceneNum);
            });
            return ;
        } else {
            //console.log("auto next");
            this.scrollNext(sceneNum);
        }
        this.loop(sceneNum);
    },
    prev: function(sceneNum,force){
        var self = this;
        if(this.currentSceneNo < sceneNum) {
            return this.next(sceneNum,force);
        }
        // this.sceneDOMs.eq(this.currentSceneNo).one(this.currentSceneNo, function(){
        //     $(this).hide();
        // });

        if( true == force){
            this.scrollPrev(sceneNum);
        } else if(this.execAction.prev && typeof this.execAction.prev == 'function'){
            this.execAction.prev(function(){
                self.loop(sceneNum);
            });
            return ;
        } else {
            console.log("auto prev");
            this.scrollPrev(sceneNum);
        }
        this.loop(sceneNum);
    },
    //common
    scrollNext: function(nextIndex, fn, speed){
        var self = this;
        
        sceneIndex = this.currentSceneNo;
        
        if(!$.os.iphone){
            speed = "linear";
        }
        nextIndex = undefined !== nextIndex ? nextIndex : sceneIndex +1;
        if(this.sceneDOMs.eq(sceneIndex).attr("touch-sensitive") === undefined ){
            this.sceneDOMs.eq(nextIndex).css({
                visibility: "visible",
                transform: "translateY(" + app.window.height + "px" + ")",
            });
        }
        this.prevSceneNo = sceneIndex;
        this.currentSceneNo = nextIndex;
        this.nextSceneNo = nextIndex + 1;
        console.log("prev", this.prevSceneNo, "current", this.currentSceneNo, "will-next", this.nextSceneNo);

        this.sceneDOMs.each(function(index,that){
            if(index == self.prevSceneNo || index == self.nextSceneNo || index == self.currentSceneNo){
                self.sceneDOMs.eq(index).css({
                    visibility: "visible",
                });
            } else {
                self.sceneDOMs.eq(index).css({
                    visibility: "hidden",
                });
            }
        });

        this.sceneDOMs.eq(sceneIndex).animate({
            translateY: - this.sceneDOMs.eq(sceneIndex).height() + "px",
        }, speed ? speed : TURN_SPEED, 'ease-in-out');

        this.sceneDOMs.eq(nextIndex).animate({
            translateY: 0,
            opacity: 1,
        }, speed ? speed : TURN_SPEED, 'ease-in-out', function(){
            self.done(nextIndex);
        });
        if(sceneIndex == 0){
            return;
        }
        this.sceneDOMs.eq(sceneIndex-1).css({
            transform: "translateY(" + (- app.window.height ) + "px" + ")",
            opacity: 1,
            visibility: "hidden",
        });
        

        
    },
    scrollPrev: function(nextIndex, fn, speed){
        var self = this;
        sceneIndex = this.currentSceneNo;
        if(!$.os.iphone){
            speed = "linear";
        }
        nextIndex = undefined !== nextIndex ? nextIndex : sceneIndex -1;
        
        if(this.sceneDOMs.eq(sceneIndex).attr("touch-sensitive") === undefined ){
            this.sceneDOMs.eq(nextIndex).css({
                visibility: "visible",
                transform: "translateY(" + (- this.sceneDOMs.eq(nextIndex).height()) + "px" + ")",
            });
        }
        this.prevSceneNo = sceneIndex;
        this.currentSceneNo = nextIndex;
        this.nextSceneNo = nextIndex - 1;
        console.log("prev", this.prevSceneNo, "current", this.currentSceneNo, "will-next", this.nextSceneNo);

        this.sceneDOMs.each(function(index,that){
            if(index == self.prevSceneNo || index == self.nextSceneNo || index == self.currentSceneNo){
                self.sceneDOMs.eq(index).css({
                    visibility: "visible",
                });
            } else {
                self.sceneDOMs.eq(index).css({
                    visibility: "hidden",
                });
            }
        });

        this.sceneDOMs.eq(sceneIndex).animate({
            translateY: app.window.height + "px",
        }, speed ? speed : TURN_SPEED, 'ease-in-out');
        this.sceneDOMs.eq(nextIndex).animate({
            translateY: 0,
            opacity: 1,
        }, speed ? speed : TURN_SPEED, 'ease-in-out', function(){
            self.done(nextIndex);
        });

        if(sceneIndex + 1 == this.sceneCount - 1){
            return;
        }
        this.sceneDOMs.eq(sceneIndex + 1).animate({
            transform: "translateY(" + (app.window.height) + "px" + ")",
            opacity: 1,
            visibility: "visible",
        });

        

    },

    fadeInNext: function(nextIndex, fn, speed){
        var self = this;
        sceneIndex = this.currentSceneNo;
        if(!$.os.iphone){
            speed = "linear";
        }
        nextIndex = undefined !== nextIndex ? nextIndex : this.currentSceneNo +1;
       
        this.sceneDOMs.eq(nextIndex).css({
            transform: 'translateY(0)',
            opacity: 0,
            visibility: 'visible'
        }).animate({
            opacity: 1,
        }, speed ? speed : TURN_SPEED, 'ease-in-out');

        this.currentSceneNo = nextIndex;
        this.sceneDOMs.eq(sceneIndex).animate({
            opacity: 0,
            translateY: 0,
        }, speed ? speed : TURN_SPEED, 'ease-in-out', function(){
            self.done(nextIndex);
        });

    },
    fadeInPrev: function(nextIndex, fn, speed){
        var self = this;
        sceneIndex = this.currentSceneNo;
        if(!$.os.iphone){
            speed = "linear";
        }
        nextIndex = undefined !== nextIndex ? nextIndex : this.currentSceneNo -1;

        this.sceneDOMs.eq(nextIndex).css({
            transform: 'translateY(0)',
            opacity: 0,
            visibility: 'visible'
        }).animate({
            opacity: 1,
        }, speed ? speed : TURN_SPEED, 'ease-in-out');

        this.currentSceneNo = nextIndex;
   
        this.sceneDOMs.eq(sceneIndex).animate({
            opacity: 0,
            translateY: 0,
        }, speed ? speed : TURN_SPEED, 'ease-in-out', function(){
            self.done(nextIndex);
        });
        
    }

}


