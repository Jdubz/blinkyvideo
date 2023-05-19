import React from 'react';
import { useRef, useEffect, useState } from 'react';
import './App.css';

const utils = {

  rndInt(max : number) {
      return Math.round(Math.random() * max);
  },
  
  /**
   * https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle
   * https://math.stackexchange.com/questions/1413372/find-cartesian-coordinates-of-the-incenter
   * https://www.mathopenref.com/coordincenter.html
   */
  calcIncircle(A: Array<number>, B : Array<number>, C: Array<number>) {
      function lineLen(p1 : Array<number>, p2: Array<number>) {
        console.log('lineLen', arguments);

          const dx = p2[0] - p1[0],
                dy = p2[1] - p1[1];
          return Math.sqrt(dx*dx + dy*dy);
      }
      
      //Side lengths, perimiter p and semiperimiter s:
      const a = lineLen(B, C),
            b = lineLen(C, A),
            c = lineLen(A, B),
            p = (a + b + c),
            s = p/2;
      
      //Heron's formula
      //https://www.wikihow.com/Calculate-the-Area-of-a-Triangle#Using_Side_Lengths
      const area = Math.sqrt(s * (s-a) * (s-b) * (s-c));
      //Faster(?) alternative:
      //http://geomalgorithms.com/a01-_area.html#Modern-Triangles
      //const area = Math.abs( (B[0]-A[0])*(C[1]-A[1]) - (C[0]-A[0])*(B[1]-A[1]) )/2;

      //Incircle radius r
      //  https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle#Relation_to_area_of_the_triangle
      //..and center [cx, cy]
      //  https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle#Cartesian_coordinates
      //  https://www.mathopenref.com/coordincenter.html
      const r = area/s,
            cx = (a*A[0] + b*B[0] + c*C[0]) / p,
            cy = (a*A[1] + b*B[1] + c*C[1]) / p;
      return {
          r,
          c: [cx, cy],
      }
  },
  
  /*
   * https://math.stackexchange.com/questions/17561/how-to-shrink-a-triangle
   */
  expandTriangle(A : Array<number>, B : Array<number>, C : Array<number>, amount :number) {
    console.log('expandTriangle', arguments);

      const incircle = this.calcIncircle(A, B, C),
            c = incircle.c,
            factor = (incircle.r + amount)/(incircle.r);
      
      function extendPoint(p: Array<number>) {
          const dx = p[0] - c[0],
                dy = p[1] - c[1],
                x2 = (dx * factor) + c[0],
                y2 = (dy * factor) + c[1];
          return [x2, y2];
      }
      
      const A2 = extendPoint(A),
            B2 = extendPoint(B),
            C2 = extendPoint(C);
      return[A2, B2, C2];
  },

  /**
   *  Solves a system of linear equations.
   *
   *  t1 = (a * r1) + (b + s1) + c
   *  t2 = (a * r2) + (b + s2) + c
   *  t3 = (a * r3) + (b + s3) + c
   *
   *  r1 - t3 are the known values.
   *  a, b, c are the unknowns to be solved.
   *  returns the a, b, c coefficients.
   */
  linearSolution(r1 : number, s1 : number, t1 : number, r2 : number, s2 : number, t2 : number, r3 : number, s3 : number, t3 : number)
  {
      var a = (((t2 - t3) * (s1 - s2)) - ((t1 - t2) * (s2 - s3))) / (((r2 - r3) * (s1 - s2)) - ((r1 - r2) * (s2 - s3)));
      var b = (((t2 - t3) * (r1 - r2)) - ((t1 - t2) * (r2 - r3))) / (((s2 - s3) * (r1 - r2)) - ((s1 - s2) * (r2 - r3)));
      var c = t1 - (r1 * a) - (s1 * b);

      return [a, b, c];
  },

  lineIntersect([[x1, y1], [x2, y2]]: Array<Array<number>>, [[x3, y3], [x4, y4]]: Array<Array<number>>)
  {
      var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
      if (denom == 0) {
          return null;
      }
      ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
      ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
      // return {
      //     x: x1 + ua * (x2 - x1),
      //     y: y1 + ua * (y2 - y1),
      //     seg1: ua >= 0 && ua <= 1,
      //     seg2: ub >= 0 && ub <= 1
      // };

      return [
        x1 + ua * (x2 - x1), 
        y1 + ua * (y2 - y1)
      ]
  },

  findCenter(corners: Array<Array<number>>) {
    return utils.lineIntersect([corners[0], corners[3]], [corners[2],corners[1]]);


  },

  /**
   *  This draws a triangular area from an image onto a canvas,
   *  similar to how ctx.drawImage() draws a rectangular area from an image onto a canvas.
   *
   *  s1-3 are the corners of the triangular area on the source image, and
   *  d1-3 are the corresponding corners of the area on the destination canvas.
   *
   *  Those corner coordinates ([x, y]) can be given in any order,
   *  just make sure s1 corresponds to d1 and so forth.
   */
  drawImageTriangle(
    img : CanvasImageSource, 
    ctx : CanvasRenderingContext2D, 
    s1 : Array<number>, 
    s2 : Array<number>, 
    s3 : Array<number>, 
    d1 : Array<number>, 
    d2 : Array<number>, 
    d3 : Array<number>
  ) {
      //I assume the "m" is for "magic"...
      const xm = this.linearSolution(s1[0], s1[1], d1[0],  s2[0], s2[1], d2[0],  s3[0], s3[1], d3[0]),
            ym = this.linearSolution(s1[0], s1[1], d1[1],  s2[0], s2[1], d2[1],  s3[0], s3[1], d3[1]);

      ctx.save();

      ctx.setTransform(xm[0], ym[0], xm[1], ym[1], xm[2], ym[2]);
      ctx.beginPath();
      ctx.moveTo(s1[0], s1[1]);
      ctx.lineTo(s2[0], s2[1]);
      ctx.lineTo(s3[0], s3[1]);
      ctx.closePath();
      //Leaves a faint black (or whatever .fillStyle) border around the drawn triangle
      //  ctx.fill();
      ctx.clip();
      ctx.drawImage(img, 0, 0, Number(img.width), Number(img.height));

      ctx.restore();
      
      
      // return;
      
      //DEBUG - https://en.wikipedia.org/wiki/Incircle_and_excircles_of_a_triangle
      const incircle = this.calcIncircle(d1, d2, d3),
            c = incircle.c;
      //console.log(incircle);
      ctx.beginPath();
      ctx.arc(c[0], c[1], incircle.r, 0, 2*Math.PI, false);
      ctx.moveTo(d1[0], d1[1]);
      ctx.lineTo(d2[0], d2[1]);
      ctx.lineTo(d3[0], d3[1]);
      ctx.closePath();
      //ctx.fillStyle = 'rgba(0,0,0, .3)';
      //ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,0,0, .4)';
      ctx.stroke();
  },

  drawTriangle(
    img: CanvasImageSource, 
    ctx: CanvasRenderingContext2D, 
    s1: Array<number>, 
    s2: Array<number>, 
    s3: Array<number>, 
    d1: Array<number>, 
    d2: Array<number>, 
    d3: Array<number>
  ) {
    console.log('drawTriangle', arguments);
    // function movePoint(p: Array<number>, exampleSource: Array<number>, exampleTarget: Array<number>) {
    //     const dx = exampleTarget[0]/exampleSource[0],
    //           dy = exampleTarget[1]/exampleSource[1],
    //           p2 = [p[0] * dx, p[1] * dy];
    //     return p2;
    // }
    //Overlap the destination areas a little
    //to avoid hairline cracks when drawing mulitiple connected triangles.
    const [d1x, d2x, d3x] = utils.expandTriangle(d1, d2, d3, .3),
          [s1x, s2x, s3x] = utils.expandTriangle(s1, s2, s3, .3);
          //s1x = movePoint(s1, d1, d1x),
          //s2x = movePoint(s2, d2, d2x),
          //s3x = movePoint(s3, d3, d3x);
    
    utils.drawImageTriangle(
      img, 
      ctx,
      s1x, s2x, s3x,
      d1x, d2x, d3x
    );
  },
};

function updateUI(
  img: CanvasImageSource, 
  ctx: CanvasRenderingContext2D, 
  points: Array<any>, 
  w: number, 
  h: number, 
  //handles: Array<HTMLElement>
) {
  console.log('updateUI', arguments);

  ctx.clearRect(0,0, w,h);
  
  utils.drawTriangle(
    img, ctx, 
    [0, 0], [w/2, h/2], [0, h], 
    points[0], points[2], points[3]
  );
  utils.drawTriangle(
    img, ctx, 
    [0, 0], [w/2, h/2], [w, 0], 
    points[0], points[2], points[1]
  );
  utils.drawTriangle(
    img, ctx, 
    [w, 0], [w/2, h/2], [w, h], 
    points[1], points[2], points[4]
  );
  utils.drawTriangle(
    img, ctx, 
    [0, h], [w/2, h/2], [w, h], 
    points[3], points[2], points[4]
  );
  // points.forEach((c, i) => {
  //     console.log(c, i, handles[i]);
  //     const s = handles[i].style;
  //     s.left = c[0] + 'px';
  //     s.top =  c[1] + 'px';
  // });
}

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const getVideo = () => {
    return navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then(stream => {
        const video = videoRef.current;
        
        if (video !== null) {
          video.srcObject = stream;
          video.play();
        } else {
          console.error('video is null');
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  useEffect(() => {
    getVideo();
  }, [videoRef]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // const interval = setInterval(() => {
    //   if (videoRef.current === null) {
    //     return;
    //   }

    //   if (canvasRef.current === null) {
    //     return;
    //   }

    //   canvasRef.current.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    // }, 33); // default to 30 fps
    // return () => clearInterval(interval);

    const interval = setInterval(() => {
      if (videoRef.current === null) {
        console.warn("no videoRef.current");
        return;
      }
      if (canvasRef.current === null) {
        console.warn("no canvasRef.current");
        return;
      }
      const context = canvasRef.current.getContext('2d');
      if (context === null) {
        console.warn("no 2d context found for canvas");
        return;
      }

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      const bufferCanvas = document.createElement("canvas");
      bufferCanvas.width = videoRef.current.videoWidth;
      bufferCanvas.height = videoRef.current.videoHeight;
      const bufferCanvasContext = bufferCanvas.getContext("2d");
      if (bufferCanvasContext !== null) {
        bufferCanvasContext.drawImage(videoRef.current, 0, 0);
      }

      // const corners = [
      //   [0,0],
      //   [canvasRef.current.width, 0],
      //   [0,canvasRef.current.height],
      //   [canvasRef.current.width,canvasRef.current.height]
      // ];

      // const points = [
      //   corners[0],
      //   corners[1],
      //   utils.findCenter(corners),
      //   corners[2],
      //   corners[3]
      // ];

      const points = [
        [0,0],
        [canvasRef.current.width, 0],
        [canvasRef.current.width/2,canvasRef.current.height/2],
        [0,canvasRef.current.height],
        [canvasRef.current.width,canvasRef.current.height]
      ];

      updateUI(
        bufferCanvas,
        context,
        points,
        canvasRef.current.width, 
        canvasRef.current.height, 
        // Array(5).fill(document.createElement('div'))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [videoRef, canvasRef]);

  return (
    <div className="App">
      <video 
        ref={videoRef}
      />
      <canvas 
        ref={canvasRef}
      />
    </div>
  );
}

export default App;
