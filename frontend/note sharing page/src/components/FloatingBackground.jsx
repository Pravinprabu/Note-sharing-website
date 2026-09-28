import React from 'react';
import { 
  Laptop, 
  Ruler, 
  Atom, 
  Calculator, 
  Cpu, 
  Binary, 
  Compass, 
  Microscope, 
  Layers, 
  Code2, 
  BookOpen, 
  Activity 
} from 'lucide-react';
import './FloatingBackground.css';

const FloatingBackground = () => {
  return (
    <div className="floating-background-container" aria-hidden="true">
      {/* 1. Laptop - Top Left */}
      <div className="floating-element float-1 amber" style={{ top: '8%', left: '5%' }}>
        <Laptop size={24} />
      </div>

      {/* 2. Ruler / Scale - Top Right */}
      <div className="floating-element float-2" style={{ top: '14%', right: '7%' }}>
        <Ruler size={24} />
      </div>

      {/* 3. Atom / Physics - Middle Left */}
      <div className="floating-element float-3 teal" style={{ top: '34%', left: '10%' }}>
        <Atom size={28} />
      </div>

      {/* 4. Calculator / Maths - Middle Right */}
      <div className="floating-element float-4 amber" style={{ top: '44%', right: '9%' }}>
        <Calculator size={24} />
      </div>

      {/* 5. CPU / Circuit - Lower Left */}
      <div className="floating-element float-1 indigo" style={{ top: '68%', left: '6%' }}>
        <Cpu size={26} />
      </div>

      {/* 6. Binary / Coding - Lower Right */}
      <div className="floating-element float-2 teal" style={{ top: '78%', right: '11%' }}>
        <Binary size={26} />
      </div>

      {/* 7. Compass / Geometry - Top Center */}
      <div className="floating-element float-3 hide-on-mobile" style={{ top: '18%', left: '38%' }}>
        <Compass size={22} />
      </div>

      {/* 8. Microscope / Science - Bottom Center */}
      <div className="floating-element float-4 indigo hide-on-mobile" style={{ top: '82%', left: '42%' }}>
        <Microscope size={24} />
      </div>

      {/* 9. Code - Upper Right Center */}
      <div className="floating-element float-1 amber hide-on-mobile" style={{ top: '26%', right: '28%' }}>
        <Code2 size={24} />
      </div>

      {/* 10. Layers / Engineering Drawings - Far Left */}
      <div className="floating-element float-2 hide-on-mobile" style={{ top: '52%', left: '2%' }}>
        <Layers size={22} />
      </div>

      {/* 11. Laptop - Far Right */}
      <div className="floating-element float-3 hide-on-mobile" style={{ top: '62%', right: '3%' }}>
        <Laptop size={22} />
      </div>

      {/* 12. Activity / Signal Waves - Lower Center */}
      <div className="floating-element float-4 teal hide-on-mobile" style={{ top: '92%', right: '30%' }}>
        <Activity size={22} />
      </div>

      {/* 13. Physics Atom - Upper Center */}
      <div className="floating-element float-1 indigo hide-on-mobile" style={{ top: '6%', left: '62%' }}>
        <Atom size={22} />
      </div>

      {/* 14. Book / Notes - Bottom Left */}
      <div className="floating-element float-2 amber hide-on-mobile" style={{ top: '88%', left: '18%' }}>
        <BookOpen size={22} />
      </div>
    </div>
  );
};

export default FloatingBackground;
