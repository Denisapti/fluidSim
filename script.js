// Matter.js setup
const { Engine, Render, World, Bodies, Body, Events, Composite } = Matter;

//create engine and world
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

// Step 3: Create fluid particles
const particles = [];
const numParticles = 1000;
const particleRadius = 25;

//for each particle
for (let i = 0; i < numParticles; i++) {
    //set x,y pos within window boundry
    let x = window.innerWidth / 2 + Math.random() * 150 - 50;
    let y = window.innerHeight / 4 + Math.random() * 150 - 50;
    
    //make a matter object
    let particle = Bodies.circle(x, y, particleRadius, {
        friction: 0.05,
        restitution: 0.0000001, // Bounciness (reducing makes fluid-like)
        density: 0.01,
        render: { fillStyle: 'blue' }
    });

    //adds the particle to the list and to the matter world
    particles.push(particle);
    World.add(world, particle);
}

// Step 4: Create container walls
const boundaries = [
    // Floor
    Bodies.rectangle(window.innerWidth / 2, window.innerHeight, window.innerWidth, 30, { isStatic: true }),
    
    // Left wall
    Bodies.rectangle(0, window.innerHeight / 2, 30, window.innerHeight, { isStatic: true }),
    
    // Right wall
    Bodies.rectangle(window.innerWidth, window.innerHeight / 2, 30, window.innerHeight, { isStatic: true }),
    
    // Ceiling
    Bodies.rectangle(window.innerWidth / 2, 0, window.innerWidth, 30, { isStatic: true })
];
// add them to the world
World.add(world, boundaries);

function applyFluidForces() {
    let radius = particleRadius * 1.2; // Interaction range for fluid effect

    // for every particle
    for (let p1 of particles) {
        let force = Matter.Vector.create(0, 0); //makes blank force

        //and for every particle(again)
        for (let p2 of particles) {
            if (p1 === p2) continue; //skip id self referencing

            let dir = Matter.Vector.sub(p2.position, p1.position); // vector from p1 to p2
            let distance = Matter.Vector.magnitude(dir);// pythag of vector outputs the raw distance

            if (distance < radius && distance > 0) { //check if the 2 particles are close enough
                // Normalize direction
                dir = Matter.Vector.normalise(dir); // removes magnitude, outputs only direction
                
                // Apply repulsion force (pressure)           (rad - dist) makes closer particles have stronger force
                let strength = (radius - distance) * 0.0001;// *0.0... is a scaling factor
                force = Matter.Vector.add(force, Matter.Vector.mult(dir, -strength));
            }   // the force is a vector with the direction to the particle,
                // and the magnitude is the negative strength, to push instead of pull
        }

        // Apply slight viscosity (damping)
        p1.velocity.x *= 0.98;
        p1.velocity.y *= 0.98;

        // Apply final force
        Body.applyForce(p1, p1.position, force);
    }  // three parameters: (the body acted on, where on the body its applied, force vector used)
}

function update() { //each frame
    applyFluidForces(); 
    requestAnimationFrame(update);// calls itself
}

update();// run simulation

document.addEventListener("mousemove", (event) => {//waits for movement
    let mousePos = { x: event.clientX, y: event.clientY }; // documents position

    for (let p of particles) {// for all particles
        let distance = Matter.Vector.magnitude(Matter.Vector.sub(p.position, mousePos));
        //find distance to mouse


        if (distance < 150) {// only within range
            let push = Matter.Vector.sub(p.position, mousePos);//creates a vector
            let force = Matter.Vector.normalise(push); //disregard distance, magnitude only
            Body.applyForce(p, p.position, Matter.Vector.mult(force, 1));// apply the force
        }
    }
});
