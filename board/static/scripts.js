try {
try {
    if (typeof MatterWrap !== 'undefined') {Matter.use('matter-wrap');} 
    else {Matter.use(require('matter-wrap'));}
} catch (e) {}

const   Engine = Matter.Engine,
        Render = Matter.Render,
        Runner = Matter.Runner,
        Bodies = Matter.Bodies,
        Body = Matter.Body,
        Composite = Matter.Composite,
        Composites = Matter.Composites,
        Vector= Matter.Vector,
        Common = Matter.Common,
        MouseConstraint = Matter.MouseConstraint,
        Constraint = Matter.Constraint,
        Mouse = Matter.Mouse,
        Svg = Matter.Svg,
        World = Matter.World,
        Vertices = Matter.Vertices,
        Events = Matter.Events; 

const   iEngine = Engine.create({gravity: {y:1}}),
        world = iEngine.world;

const   iRunner = Runner.create();

const   iRender = Render.create({
            element: document.body,
            engine: iEngine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: 'transparent',
                wireframeBackground: 'transparent',
                //showAngleIndicator: true,
            }
        });

var circle_array = [];
function create_circles(x,y,color,apply_force){

  if (color =="gray") {
    let gray = Common.random(0,255);
    var curr_color = `rgb(${gray},${gray},${gray})`
  
  }else{

    var curr_color = `rgb(${Common.random(0,255)},${Common.random(0,255)},${Common.random(0,255)})`;
  }

  var circles = Bodies.circle(x+Common.random(-5,5),y+Common.random(-5,5),Common.random(5,30),
    {
      restitution: 0.8,
      friction: 0.1,
      //url: '#',
      render:{
        fillStyle:curr_color,
        strokeStyle:'white',
        lineWidth:2
      }});
  
  if(apply_force == 1){
    Body.applyForce(circles, {x: circles.position.x, y: circles.position.y}, {x: Common.random(-0.05,0.05), y: Common.random(-0.05,0.05)})
  }
      
    

    Composite.add(world,circles);
    circle_array.push(circles);
    //setTimeout(function(){Composite.remove(world,circles);},1000);
};

function del_obj(el) {
    for (let i = 0; i < circle_array.length; i++) {
        Composite.remove(iEngine.world,circle_array[i]);
    }
}

function color_obj(el) {
    for (let i = 0; i < circle_array.length; i++) {
      circle_array[i].render.fillStyle=`rgb(${Common.random(0,255)},${Common.random(0,255)},${Common.random(0,255)})`;
    } 
}

let mode = 1;
function gravity_obj(el) {
    switch (mode) {
        case 1:
            iEngine.gravity.y = 1;
            mode = 2;
            break;
        case 2:
            iEngine.gravity.y = 0;
            mode = 1;
            break;
        default:
            break;
    }
    console.log(mode);
}

var i = 1;
function party_obj(el) { 
    setTimeout(() => {
        create_circles(Common.random(0,window.innerWidth),Common.random(0,window.innerHeight),"_",1);
        i++;
        if(i<200){party_obj()}
        else{i = 1;}
    }, 10);
} 

function create_walls() {
  const wall_bottom = Bodies.rectangle(window.innerWidth/2,window.innerHeight,window.innerWidth,10,{isStatic: true,density:10});
  const wall_top = Bodies.rectangle(window.innerWidth/2,-10,window.innerWidth,10,{isStatic: true,density:10});
  const wall_left = Bodies.rectangle(-10,window.innerHeight/2,10,window.innerHeight,{isStatic: true,density:10});
  const wall_right = Bodies.rectangle(window.innerWidth,window.innerHeight/2,10,window.innerHeight,{isStatic: true,density:10});
  Composite.add(world, [wall_bottom,wall_top,wall_left,wall_right]);
}

function create_env_interaction_buttons() {

  var button_del_obj = Bodies.circle(window.innerWidth*0.15,350,30,{
    isStatic: false,
    url: "del_obj",
    restitution: 0.8,
    friction: 0.1,
    render:{
      lineWidth:2,
      sprite:{
        texture:"https://media.publit.io/file/trash-svgrepo-com-2.png",
        xScale:0.2083,
        yScale:0.2083
      }   
    }
  });

  var button_color_obj = Bodies.circle(window.innerWidth*0.15,150,30,{
    isStatic: false,
    url: "color_obj",
    restitution: 0.8,
    friction: 0.1,
    render:{
      lineWidth:2,
      sprite:{
        texture:"https://media.publit.io/file/color-palette-svgrepo-com.png",
        xScale:0.2083,
        yScale:0.2083
      }   
    }
  });

  var button_gravity_obj = Bodies.circle(window.innerWidth*0.15,250,30,{
    isStatic: false,
    url: "gravity_obj",
    restitution: 0.8,
    friction: 0.1,
    render:{
      lineWidth:2,
      sprite:{
        texture:"https://media.publit.io/file/gravity-svgrepo-com.png",
        xScale:0.2083,
        yScale:0.2083
      }   
    }
  });

  var button_party_obj = Bodies.circle(window.innerWidth*0.15,50,30,{
    isStatic: false,
    url: "party_obj",
    restitution: 0.8,
    friction: 0.1,
    render:{
      lineWidth:2,
      sprite:{
        texture:"https://media.publit.io/file/party-horn-svgrepo-com.png",
        xScale:0.2083,
        yScale:0.2083,
      }   
    }
  });

  link0 = Constraint.create({
    pointA: {x:window.innerWidth*0.20, y:0},
    bodyB: button_party_obj,
    stiffness: 0.1,
    length:50,
    render:{
      lineWidth:1,
      type: 'line',
      anchors: false,
      strokeStyle: '#393E46'
    }
  });

  link1 = Constraint.create({
    bodyA: button_party_obj,
    bodyB: button_color_obj,
    stiffness: 0.1,
    render:{
      lineWidth:1,
      type: 'line',
      anchors: false,
      strokeStyle: '#393E46'
    }
  });

  link2 = Constraint.create({
    bodyA: button_color_obj,
    bodyB: button_gravity_obj,
    stiffness: 0.1,
    render:{
      lineWidth:1,
      type: 'line',
      anchors: false,
      strokeStyle: '#393E46'
    }
  });

  link3 = Constraint.create({
    bodyA: button_gravity_obj,
    bodyB: button_del_obj,
    stiffness: 0.1,
    render:{
      lineWidth:1,
      type: 'line',
      anchors: false,
      strokeStyle: '#393E46'
    }
  });

  World.add(world,[link0,link1,link2,link3]);
  World.add(world,[button_color_obj,button_del_obj,button_gravity_obj,button_party_obj])
}

function create_social_buttons() {
  var button_github = Bodies.circle(50,50,30,{
    isStatic: false,
    url: "https://github.com/ikaganacar1",
    restitution: 0.8,
    friction: 0.1,
    render:{
      lineWidth:2,
      sprite:{
        texture:"https://media.publit.io/file/github-142-svgrepo-com.png",
        xScale:0.2083,
        yScale:0.2083
      }   
    }
  });

  var button_instagram = Bodies.circle(50,150,30,{
    isStatic: false,
    url: "https://www.instagram.com/ikaganacar/",
    restitution: 0.8,
    friction: 0.1,
    render:{
      lineWidth:2,
      sprite:{
        texture:"https://media.publit.io/file/instagram-svgrepo-com.png",
        xScale:0.2083,
        yScale:0.2083
      }   
    }
  });

  var button_x = Bodies.circle(50,250,30,{
    isStatic: false,
    url: "https://x.com/ikaganacar",
    restitution: 0.8,
    friction: 0.1,
    render:{
      lineWidth:2,
      sprite:{
        texture:"https://media.publit.io/file/twitter-svgrepo-com.png",
        xScale:0.2083,
        yScale:0.2083
      }   
    }
  });

  var button_linkedin = Bodies.circle(50,350,30,{
    isStatic: false,
    url: "https://www.linkedin.com/in/ismail-kağan-acar-24481b24b/",
    restitution: 0.8,
    friction: 0.1,
    render:{
      lineWidth:2,
      sprite:{
        texture:"https://media.publit.io/file/linkedin-svgrepo-com.png",
        xScale:0.2083,
        yScale:0.2083
      }   
    }
  });

  var button_mail = Bodies.circle(50,450,30,{
    isStatic: false,
    url: "mailto:acarismailkagan@gmail.com",
    restitution: 0.8,
    friction: 0.1,
    render:{
      lineWidth:2,
      sprite:{
        texture:"https://media.publit.io/file/mail-pencil-svgrepo-com.png",
        xScale:0.2083,
        yScale:0.2083
      }   
    }
  });

  link0 = Constraint.create({
    pointA: {x:window.innerWidth*0.1, y:0},
    bodyB: button_github,
    stiffness: 0.1,
    length:50,
    render:{
      lineWidth:1,
      type: 'line',
      anchors: false,
      strokeStyle: '#393E46'
    }
  });

  link1 = Constraint.create({
    bodyA: button_github,
    bodyB: button_instagram,
    stiffness: 0.1,
    render:{
      lineWidth:1,
      type: 'line',
      anchors: false,
      strokeStyle: '#393E46'
    }
  });

  link2 = Constraint.create({
    bodyA: button_instagram,
    bodyB: button_x,
    stiffness: 0.1,
    render:{
      lineWidth:1,
      type: 'line',
      anchors: false,
      strokeStyle: '#393E46'
    }
  });

  link3 = Constraint.create({
    bodyA: button_x,
    bodyB: button_linkedin,
    stiffness: 0.1,
    render:{
      lineWidth:1,
      type: 'line',
      anchors: false,
      strokeStyle: '#393E46'
    }
  });

  link4 = Constraint.create({
    bodyA: button_linkedin,
    bodyB: button_mail,
    stiffness: 0.1,
    render:{
      lineWidth:1,
      type: 'line',
      anchors: false,
      strokeStyle: '#393E46'
    }
  });

  World.add(world,[link0,link1,link2,link3,link4]);
  World.add(world,[button_github,button_instagram,button_x,button_linkedin,button_mail,]);

}//end of create social button function

//detect mouse
let mouse = Mouse.create(iRender.canvas);
let mouseConstraint = Matter.MouseConstraint.create(iEngine, {
    element: document.body,
    constraint: {
        render: {
            visible: false
        },
        stiffness: 0.8
    }
});Matter.World.add(world, mouseConstraint);

//event detections
let check_if_clicked = false;
Events.on(mouseConstraint,'mousedown',function(event){
  check_if_clicked=true;
  var mc = event.source;
  var bodies = world.bodies;

  if (!mc.bodyB) {
    for (i = 0; i < bodies.length; i++) { 
      var body = bodies[i];
      if (Matter.Bounds.contains(body.bounds, mc.mouse.position)) {
        var bodyUrl = body.url;
        console.log("Body.Url >> " + bodyUrl);
        
        if (bodyUrl == "del_obj") {
          del_obj();
          check_if_clicked=false;
        }

        else if (bodyUrl == "color_obj") {
          color_obj();
          check_if_clicked=false;
        }

        else if (bodyUrl == "gravity_obj") {
          gravity_obj();
          check_if_clicked=false;
        }

        else if (bodyUrl == "party_obj") {
          party_obj();
          check_if_clicked=false;
        }

        else if (bodyUrl != undefined) {
          window.open(bodyUrl, '_self');
          check_if_clicked=false;
          console.log("Hyperlink was opened");
        }
        
        break;
      }
    }
  }
});

Events.on(mouseConstraint,'mouseup',  function(event){
  check_if_clicked=false;
});

//if it is suitable create circles when clicked
Events.on(iEngine, 'afterUpdate', function (event) {
    if (!mouse.position.x) return;
  
    if (check_if_clicked) {
      create_circles(mouse.position.x,mouse.position.y,"gray",0);
    }
});

create_walls();
create_env_interaction_buttons();
create_social_buttons();

Render.run(iRender);
Runner.run(iRunner, iEngine);}
catch(e){console.log(e)}//global try catch to see the errors