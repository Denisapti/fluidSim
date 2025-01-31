// Matter.js setup
const { Engine, Render, World, Bodies, Body, Events, Composite } = Matter;

let engine = Engine.create();
let world = engine.world;

// Create a renderer
let render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'black'
    }
});

Render.run(render);
Engine.run(engine);
