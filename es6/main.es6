const app = new App();
var soundStatus = false;
var soundFn = function(e,status){
    //console.log("click");
    if(soundStatus == true || status == 1){
        $(".app-sound")[0].pause();
        $(".app-sound-icon").css({
            animation:'1',
            backgroundImage: null,
        });
        soundStatus = false;
    } else if(soundStatus == false  || status == 2){
        $(".app-sound")[0].play();
        if(!$.os.iphone){
            $(".app-sound-icon").css({
                backgroundImage: 'url(./image/sound-on.png)',
            });
        } else {
            $(".app-sound-icon").css({
                backgroundImage: 'url(./image/sound-on.png)',
                animation:  'app-sound-icon-frames linear 5s infinite',
            });
        }
        
        soundStatus = true;
    }
}
app.loading({
    loading: [],
    noload: [
       
    ],
},function(i,c){

    $(".app-loading").html("loading...(" + Math.ceil(i / c * 100 )+ "%)");
},

function(){ 
    $(".app-loading").remove();
    $(".app-sound-icon").show().on("click", soundFn );
    $(window).one("touchend", function(){
        soundFn();
    });
    app.init();

});

app.addAction( {
    run: function(){


    },
    init: function(){
        
     
    },
});

app.addAction( {
    run: function(){


    },
    init: function(){
        
     
    },
});
app.addAction( {
    run: function(){


    },
    init: function(){
        
    },
});
app.addAction( {
    run: function(){


    },
    init: function(){
        
    },
});
app.addAction( {
    run: function(){


    },
    init: function(){
        
    },
});
app.addAction( {
    run: function(){

        $(".scene-word").addClass("fadeInDown");
    },
    init: function(){
        $(".scene-word").removeClass("fadeInDown");
    },
});
app.auto = false;
