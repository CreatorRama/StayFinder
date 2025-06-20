import { useEffect } from 'react';
import './SolarSystemBackground.css';

const SolarSystemBackground = () => {
  useEffect(() => {
    // Create stars
    const createStars = () => {
      for (let i = 0; i < 120; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        const size = Math.random() * 2.4;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        star.style.opacity = Math.random() * 0.8 + 0.2;
        document.body.appendChild(star);
        
        setInterval(() => {
          star.style.opacity = Math.random() * 0.8 + 0.2;
        }, Math.random() * 3000 + 1000);
      }
    };
    
    // Create planets and animate them
    const createPlanets = () => {
      const container = document.querySelector('.solar-container');
      const centerX = container.offsetWidth / 2;
      const centerY = container.offsetHeight / 2;
      
      const planets = [
        { name: 'mercury', radius: 48, size: 7.2, color: '#B5B5B5', speed: 4 },
        { name: 'venus', radius: 72, size: 9.6, color: '#E8CDA2', speed: 6 },
        { name: 'earth', radius: 96, size: 10.8, color: '#4F97FF', speed: 8 },
        { name: 'mars', radius: 120, size: 8.4, color: '#FF5733', speed: 10 },
        { name: 'jupiter', radius: 150, size: 24, color: '#E0A343', speed: 14 },
        { name: 'saturn', radius: 180, size: 19.2, color: '#DAA520', speed: 18 }
      ];
      
      planets.forEach(planet => {
        const planetElement = document.createElement('div');
        planetElement.className = 'planet';
        planetElement.id = planet.name;
        planetElement.style.width = `${planet.size}px`;
        planetElement.style.height = `${planet.size}px`;
        planetElement.style.backgroundColor = planet.color;
        container.appendChild(planetElement);
        
        if (planet.name === 'saturn') {
          const rings = document.createElement('div');
          rings.className = 'planet';
          rings.id = 'saturn-rings';
          rings.style.width = `${planet.size * 2}px`;
          rings.style.height = `${planet.size * 0.4}px`;
          rings.style.border = '2px solid #DAA520';
          rings.style.backgroundColor = 'transparent';
          container.appendChild(rings);
        }
        
        let angle = Math.random() * Math.PI * 2;
        
        const animatePlanet = () => {
          angle += (Math.PI * 2) / (planet.speed * 100);
          
          const x = centerX + Math.cos(angle) * planet.radius;
          const y = centerY + Math.sin(angle) * planet.radius;
          
          planetElement.style.left = `${x - planet.size / 2}px`;
          planetElement.style.top = `${y - planet.size / 2}px`;
          
          if (planet.name === 'saturn') {
            const rings = document.getElementById('saturn-rings');
            rings.style.left = `${x - planet.size}px`;
            rings.style.top = `${y - planet.size * 0.2}px`;
          }
          
          requestAnimationFrame(animatePlanet);
        };
        
        animatePlanet();
      });
    };
    
    // Animate spaceship
    const animateSpaceship = () => {
      const spaceship = document.getElementById('spaceship');
      const container = document.querySelector('.solar-container');
      const centerX = container.offsetWidth / 2;
      const centerY = container.offsetHeight / 2;
      
      let t = 0;
      const radiusX = 300;
      const radiusY = 200;
      
      const updateSpaceshipPosition = () => {
        const x = centerX + radiusX * Math.sin(t * 0.5);
        const y = centerY + radiusY * Math.sin(t * 0.6 + 1);
        
        spaceship.style.left = `${x - 40}px`;
        spaceship.style.top = `${y - 20}px`;
        
        const angle = Math.atan2(
          Math.cos(t * 0.6 + 1) * radiusY,
          Math.cos(t * 0.5) * radiusX
        ) * 180 / Math.PI;
        
        spaceship.style.transform = `rotate(${angle}deg)`;
        
        t += 0.01;
        requestAnimationFrame(updateSpaceshipPosition);
      };
      
      updateSpaceshipPosition();
      
      // Animate flame
      const flame = document.querySelector('.spaceship-flame');
      setInterval(() => {
        flame.style.height = `${16 + Math.random() * 12}px`;
        flame.style.opacity = `${0.7 + Math.random() * 0.3}`;
      }, 100);
    };
    
    // Animate sun pulsing
    const animateSun = () => {
      const sun = document.querySelector('.sun');
      let scale = 1;
      let increasing = true;
      
      setInterval(() => {
        if (increasing) {
          scale += 0.01;
          if (scale >= 1.1) increasing = false;
        } else {
          scale -= 0.01;
          if (scale <= 0.9) increasing = true;
        }
        
        sun.style.transform = `scale(${scale})`;
      }, 50);
    };
    
    // Run everything
    createStars();
    createPlanets();
    animateSun();
    animateSpaceship();

    return () => {
      const stars = document.querySelectorAll('.star');
      stars.forEach(star => star.remove());
      
      const planets = document.querySelectorAll('.planet');
      planets.forEach(planet => planet.remove());
    };
  }, []);

  return (
    <div className="solar-container">
      {/* Sun */}
      <div className="sun"></div>
      
      {/* Orbits */}
      <div className="orbit" id="mercury-orbit"></div>
      <div className="orbit" id="venus-orbit"></div>
      <div className="orbit" id="earth-orbit"></div>
      <div className="orbit" id="mars-orbit"></div>
      <div className="orbit" id="jupiter-orbit"></div>
      <div className="orbit" id="saturn-orbit"></div>
      
      {/* Spaceship */}
      <div className="spaceship" id="spaceship">
        <div className="spaceship-fin"></div>
        <div className="spaceship-fin"></div>
        <div className="spaceship-body"></div>
        <div className="spaceship-cockpit"></div>
        <div className="spaceship-window"></div>
        <div className="spaceship-window"></div>
        <div className="spaceship-window"></div>
        <div className="spaceship-engine"></div>
        <div className="spaceship-flame"></div>
        
        {/* Astronauts */}
        <div className="astronaut astronaut1">
          <div className="astronaut-head"></div>
          <div className="astronaut-body"></div>
        </div>
        <div className="astronaut astronaut2">
          <div className="astronaut-head"></div>
          <div className="astronaut-body"></div>
        </div>
      </div>
    </div>
  );
};

export default SolarSystemBackground;