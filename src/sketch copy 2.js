const Serialism = require("total-serialism");
const Algo = Serialism.Algorithmic;
const Rand = Serialism.Stochastic;
const Gen = Serialism.Generative;

export default function sketch(p5) {
  var images = [];
  let filenames = [];
  let patternList = [];

  var minreso = 32;
  var tilewidth = 32;
  var tileheight = 32;
  var hueType = "none";

  var maxZoom = 1; // 1-4
  var zoomChance = 0;
  var zoomType = "fixed";

  var biggyChance = 0;
  var biggyMin = 1;
  var biggyMax = 2;

  var patternType = "rand";
  var caRule = 0;


  let direction = "vertical";
  let threshold = 50;
  let pixelDistance = 1;

  let editable = true;
  let editRadius = 30;

  let changes;

  let ww = () => {
    return minreso * tilewidth;
  };
  let hh = () => {
    return minreso * tileheight;
  };

  function generatePixelSort() {
    p5.pixels = [];
    changes = detectPixelChanges(threshold, pixelDistance, direction, false);
    for (let i = 0; i < changes.length; i++) {
      if (i < changes.length - 1) {
        pixelSortTo(
          changes[i].x,
          changes[i].y,
          changes[i + 1].x,
          changes[i + 1].y,
          direction
        );
      } else {
        pixelSort(changes[i].x, changes[i].y, direction);
      }
    }
    console.log(p5.pixels)
    p5.updatePixels();
  }
  
  function detectPixelChanges(
    threshold,
    distance = 1,
    direction = "vertical",
    onlyFirst = true
  ) {
    let results = [];
    direction =
      direction == "horizontal" ? p5.createVector(1, 0) : p5.createVector(0, 1);
    let pos = p5.createVector();
  
    for (let j = 0, lim = direction.x ? hh() : ww(); j < lim; j++) {
      for (let i = 0, lim = direction.x ? ww() : hh(); i < lim; i++) {
        let colBefore = getPixelValue(
          direction.x ? i - distance : j,
          direction.x ? j : i - distance
        );
        if (colBefore) {
          let col = getPixelValue(direction.x ? i : j, direction.x ? j : i);
          let d = p5.dist(
            colBefore[0],
            colBefore[1],
            colBefore[2],
            col[0],
            col[1],
            col[2]
          );
          if (d > threshold) {
            //point(direction.x ? i : j, direction.x ? j : i);
            results.push(p5.createVector(direction.x ? i : j, direction.x ? j : i));
            if (onlyFirst) break;
          }
        }
      }
    }
    return results;
  }
  
  function getPixelValue(x, y) {
    if (x < 0 || x > ww() - 1 || y < 0 || y > hh() - 1) return null;
    if (!p5.pixels.length) {p5.loadPixels(); console.log("first",p5.pixels)};
    let i = 4 * (x + y * ww());
    let r = p5.pixels[i];
    let g = p5.pixels[i + 1];
    let b = p5.pixels[i + 2];
    let a = p5.pixels[i + 3];
    return [r, g, b, a];
  }
  
  function setPixelValue(x, y, colR, colG, colB, colA = 255) {
    if (x < 0 || x > ww() - 1 || y < 0 || y > hh() - 1) return null;
    if (!p5.pixels.length) {p5.loadPixels(); console.log("first",p5.pixels)};
    let i = 4 * (x + y * ww());
    p5.pixels[i] = colR;
    p5.pixels[i + 1] = colG;
    p5.pixels[i + 2] = colB;
    p5.pixels[i + 3] = colA;
  }
  
  function pixelSort(x, y, direction = "vertical") {
    direction =
      direction == "horizontal" ? p5.createVector(1, 0) : p5.createVector(0, 1);
    let pix = [];
    let start = direction.x ? x : y;
    let end = direction.x ? ww() : hh();
    for (let i = start; i < end; i++) {
      let val = getPixelValue(direction.x ? i : x, direction.x ? y : i);
      pix.push(val);
    }
  
    pix.sort(sortFunction);
    let i = 0;
    for (let p of pix) {
      setPixelValue(
        x + direction.x * i,
        y + direction.y * i,
        p[0],
        p[1],
        p[2]
      );
      i++;
    }
  }
  
  function pixelSortTo(x1, y1, x2, y2, direction = "vertical") {
    direction =
      direction == "horizontal" ? p5.createVector(1, 0) : p5.createVector(0, 1);
    let pix = [];
    let start = direction.x ? x1 : y1;
    let end = direction.x ? ww() : hh();
    for (let i = start; i < end; i++) {
      let x = direction.x ? i : x1;
      let y = direction.x ? y1 : i;
      if (x == x2 && y == y2) break;
      let val = getPixelValue(x, y);
      pix.push(val);
    }
  
    pix.sort(sortFunction);
    let i = 0;
    for (let p of pix) {
      setPixelValue(
        x1 + direction.x * i,
        y1 + direction.y * i,
        p[0],
        p[1],
        p[2]
      );
      i++;
    }
  }
  
  function sortFunction(a, b) {
    //return brightness(color(b[0], b[1], b[2])) - brightness(color(a[0], a[1], a[2]));
    //return b[0] * b[1] * b[2] - a[0] * a[1] * a[2];
    return -(b[0] - a[0] + b[1] - a[1] + b[2] - a[2]);
  }

  

  /// HUE SHIFT START

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }

  function changeHue(r, g, b, degree) {
    var hsl = rgbToHSL(r, g, b);
    hsl.h += degree;
    if (hsl.h > 360) {
      hsl.h -= 360;
    } else if (hsl.h < 0) {
      hsl.h += 360;
    }
    return hslToRGB(hsl);
  }

  // exepcts a string and returns an object
  function rgbToHSL(r, g, b) {
    var r = r / 255,
      g = g / 255,
      b = b / 255,
      cMax = Math.max(r, g, b),
      cMin = Math.min(r, g, b),
      delta = cMax - cMin,
      l = (cMax + cMin) / 2,
      h = 0,
      s = 0;

    if (delta == 0) {
      h = 0;
    } else if (cMax == r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (cMax == g) {
      h = 60 * ((b - r) / delta + 2);
    } else {
      h = 60 * ((r - g) / delta + 4);
    }

    if (delta == 0) {
      s = 0;
    } else {
      s = delta / (1 - Math.abs(2 * l - 1));
    }

    return {
      h: h,
      s: s,
      l: l,
    };
  }

  // expects an object and returns a string
  function hslToRGB(hsl) {
    var h = hsl.h,
      s = hsl.s,
      l = hsl.l,
      c = (1 - Math.abs(2 * l - 1)) * s,
      x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
      m = l - c / 2,
      r,
      g,
      b;

    if (h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    r = normalize_rgb_value(r, m);
    g = normalize_rgb_value(g, m);
    b = normalize_rgb_value(b, m);

    return [r, g, b];
  }

  function normalize_rgb_value(color, m) {
    color = Math.floor((color + m) * 255);
    if (color < 0) {
      color = 0;
    }
    return color;
  }

  p5.hueShift = (img, degree) => {
    img.loadPixels();
    for (var i = 0; i < img.pixels.length; i += 4) {
      let r = img.pixels[i];
      let g = img.pixels[i + 1];
      let b = img.pixels[i + 2];

      let hueShifted = changeHue(r, g, b, degree);

      img.pixels[i] = hueShifted[0];
      img.pixels[i + 1] = hueShifted[1];
      img.pixels[i + 2] = hueShifted[2];
    }
    img.updatePixels();
  };

  /// HUE SHIFT END

  p5.updateWithProps = (props) => {
    console.log("ALL PROPS", props);
    if (props.filenames !== filenames) {
      console.log("FILENAMES PROP", props.filenames);
      filenames = props.filenames;
      p5.preload();
    }
    // if (props.minRes) {
    //   // console.log("FILENAMES PROP",props.minRes)
    //   minreso = parseInt(props.minRes)
    //   p5.resizeCanvas(ww(), hh());

    // }
    if (props.tileWidth !== tilewidth) {
      tilewidth = parseInt(props.tileWidth);
      p5.resizeCanvas(ww(), hh());
    }
    if (props.hueType !== hueType) {
      hueType = props.hueType;
    }
    if (props.tileHeight !== tileheight) {
      tileheight = parseInt(props.tileHeight);
      p5.resizeCanvas(ww(), hh());
    }
    if (props.patternType !== patternType) {
      patternType = props.patternType;
    }
    if (props.caRule !== caRule) {
      caRule = props.caRule;
    }
    if (props.zoomChance !== zoomChance) {
      zoomChance = props.zoomChance;
    }
    if (props.maxZoom !== maxZoom) {
      maxZoom = props.maxZoom;
    }
    if (props.zoomType !== zoomType) {
      zoomType = props.zoomType;
    }
    if (props.biggyChance !== biggyChance) {
      biggyChance = props.biggyChance;
    }
    if (props.biggyMin !== biggyMin) {
      biggyMin = props.biggyMin;
    }
    if (props.biggyMax !== biggyMax) {
      biggyMax = props.biggyMax;
    }
    // p5.redraw();
  };

  p5.preload = () => {
    images = [];
    let i = 0;
    let im;
    //   console.log(filenames)
    for (im in filenames) {
      images.push(p5.loadImage(filenames[im]));
    }
    // console.log(images);
  };

  p5.setup = () => {
    var canva = p5.createCanvas(ww(), hh());
    canva.id("bgbgbg");
    var button = p5.select("#generatebutton");
    var button2 = p5.select("#saveimage");
    var button3 = p5.select("#pixelsort");

    // button.mousePressed(() => { var canva = p5.createCanvas(ww(), hh()); canva.id("bgbgbg"); p5.redraw()});
    button.mousePressed(() => {p5.redraw()});
    button2.mousePressed(() =>
      p5.saveCanvas(canva, `glicpixpattern_${new Date().toJSON()}`, "png")
    );
    button3.mousePressed(() => {
      generatePixelSort();
    }
    );
    p5.noLoop();
  };

  p5.draw = () => {
    if (images.length > 0) {
      p5.noSmooth();
      if (hueType === "hueglic") {
        for (let j = 0; j < images.length; j++) {
          p5.hueShift(images[j], Math.floor(Math.random() * 360));
        }
      }
      // p5.remove();
      generate();
      console.log(p5.pixels)
      // generatePixelSort();


      // generateAutomata();
    }
  };

  function generateRotationList(patternType) {
    let rotateList = [];
    let totalTiles = tilewidth * tileheight;

    switch (patternType) {
      case "fixed":
    }
  }

  function generateImageList(patternType) {
    let imageList = [];
    let totalTiles = tilewidth * tileheight;
    //   console.log("PATTERN TYPE:",patternType)
    switch (patternType) {
      case "ca":
        let n1 = p5.floor(p5.random() * images.length);
        let n2 = p5.floor(p5.random() * images.length);
        while (n2 == n1) {
          n2 = p5.floor(p5.random() * images.length);
        }
        let ca = new Algo.Automaton();
        ca.feed(Rand.coin(tilewidth));
        ca.rule(caRule);
        let gens = [];
        for (let i = 0; i < tileheight; i++) {
          gens.push(ca.next());
        }
        // console.log(gens)
        imageList = gens.flat(1).map((item) => {
          if (item === 0) {
            return n1;
          } else if (item === 1) {
            return n2;
          }
        });
        break;
      case "rand":
        for (let i = 0; i < totalTiles; i++) {
          imageList.push(p5.floor(p5.random() * images.length));
        }
        break;
      case "randrow":
        for (var y = 0; y < tileheight; y++) {
          let rowRand = p5.floor(p5.random() * images.length);
          for (var x = 0; x < tilewidth; x++) {
            imageList.push(rowRand);
          }
        }
        break;
      case "randcol":
        imageList = Array(totalTiles).fill(0);
        for (var x = 0; x < tilewidth; x++) {
          let colRand = p5.floor(p5.random() * images.length);
          for (var y = 0; y < tileheight; y++) {
            imageList[tilewidth * y + x] = colRand;
          }
        }
        break;
      case "seq":
        for (let i = 0; i < totalTiles; i++) {
          imageList.push(i % images.length);
        }
        break;
      case "seqPalindrome":
        let sequence = Gen.spread(images.length).concat(
          Gen.spread(images.length).reverse()
        );
        for (let i = 0; i < totalTiles; i++) {
          imageList.push(sequence[i % sequence.length]);
        }
        break;
      case "seqrow":
        for (var y = 0; y < tileheight; y++) {
          let rowSeq = y % images.length;
          for (var x = 0; x < tilewidth; x++) {
            imageList.push(rowSeq);
          }
        }
        break;
      case "seqcol":
        imageList = Array(totalTiles).fill(0);
        for (var x = 0; x < tilewidth; x++) {
          let colSeq = x % images.length;
          for (var y = 0; y < tileheight; y++) {
            imageList[tilewidth * y + x] = colSeq;
          }
        }
        break;
      // case "euclid":
      //   imageList = Array(totalTiles).fill(0)
      //   for (var x = 0; x < tilewidth; x++) {
      //     let colSeq = x % images.length
      //     for (var y = 0; y < tileheight; y++) {
      //         imageList[ (tilewidth * y) + x ] = colSeq;
      //   }}
      //   break;
      // case "hexbeat":
      //   imageList = Array(totalTiles).fill(0)
      //   for (var x = 0; x < tilewidth; x++) {
      //     let colSeq = x % images.length
      //     for (var y = 0; y < tileheight; y++) {
      //         imageList[ (tilewidth * y) + x ] = colSeq;
      //   }}
      //   break;
      case "drunk":
        let nextNumber = p5.floor(p5.random() * images.length);
        for (let i = 0; i < totalTiles; i++) {
          nextNumber =
            Rand.coin(1)[0] == 1
              ? (nextNumber + 1) % images.length
              : nextNumber == 0
              ? images.length - 1
              : nextNumber - 1;

          imageList.push(nextNumber);
        }
        // console.log(imageList);
        break;
      case "single":
        let randImg = p5.floor(p5.random() * images.length);
        imageList = Array(totalTiles).fill(randImg);
        //   console.log(imageList)
        break;
      default:
        imageList = [0];
    }

    return imageList;
  }

  function generate() {
    p5.push()
    let w = ww();
    let h = hh();
    // console.log(w,h)
    let imageList = generateImageList(patternType);
    // console.log(imageList)
    let im;
    let i = 0;
    // p5.tint(p5.random() * 255, p5.random() * 255, p5.random() * 255);
    // let huestart = Math.floor(Math.random() * 360)
    p5.translate(minreso / 2, minreso / 2);

    let huestep = Math.floor(Math.random() * 360);
    for (var y = 0; y < h; y = y + minreso) {
      for (var x = 0; x < w; x = x + minreso) {
        // p5.imageMode(p5.CENTER)

        // p5.push()
        im = imageList[i];
        if (hueType === "huegrid") {
          p5.hueShift(images[im], Math.floor(Math.random() * 360));
        } else if (hueType === "hueseq") {
          // huestart = (huestart + huestep) % 360
          // console.log(huestart)
          p5.hueShift(images[im], huestep);
        }
        // if (i % 2 == 0) {
        //   p5.scale(-1, 1);
        // }
        //
        p5.angleMode(p5.DEGREES);

        // // p5.translate(xPosition, yPosition);
        p5.imageMode(p5.CENTER);
        p5.push(); // 1
        // p5.angleMode(p5.DEGREES);

        let imageRotation = Math.floor(Math.random() * 4) * 90;

        p5.rotate(imageRotation);

        let f = Math.floor(Math.random() * 4);
        // let f = 0
        // console.log(f);

        //     // p5.push();
        switch (f) {
          case 1:
            p5.scale(-1, 1);
            break;

          case 2:
            p5.scale(1, -1);
            break;
          case 3:
            p5.scale(-1, -1);
            break;

          // default:
          //   "lol";
        }

        // p5.pop()
        // p5.rotate(imageRotation * -1);

        let isZoom = p5.map(Math.random(), 0, 1, 0, 100) <= zoomChance;
        if (isZoom) {
          if (zoomType === "fixed") {
            p5.image(images[im], x, y, minreso * maxZoom, minreso * maxZoom);
          } else if (zoomType === "spread") {
            // let z = Math.floor(Math.random() * maxZoom) + 1
            let z = p5.map(Math.random(), 0, 1, 1, maxZoom);
            p5.image(images[im], 0, 0, minreso * z, minreso * z);
          } else if (zoomType === "spreadxy") {
            // p5.push()

            p5.image(
              images[im],
              0,
              0,
              minreso * p5.map(Math.random(), 0, 1, 1, maxZoom),
              minreso * p5.map(Math.random(), 0, 1, 1, maxZoom)
            );
          } else if (zoomType === "best") {
            let z = p5.map(Math.random(), 0, 1, 1, maxZoom);
            let dWidth = minreso;
            let dHeight = minreso;
            let sx = p5.map(Math.random(), 0, 1, 0, minreso - minreso / z);
            let sy = p5.map(Math.random(), 0, 1, 0, minreso - minreso / z);
            let sWidth = minreso / z;
            let sHeight = minreso / z;
            p5.image(
              images[im],
              0,
              0,
              dWidth,
              dHeight,
              sx,
              sy,
              sWidth,
              sHeight
            );
          } else if (zoomType === "best2") {
            let z = p5.map(Math.random(), 0, 1, 1, maxZoom);
            // let dWidth = minreso / p5.map(Math.random(), 0, 1, 1, maxZoom);
            let dWidth = minreso / p5.map(Math.random(), 0, 1, 1, maxZoom);
            // let dHeight = minreso / p5.map(Math.random(), 0, 1, 1, maxZoom);
            let dHeight = minreso / p5.map(Math.random(), 0, 1, 1, maxZoom);
            let sx = p5.map(Math.random(), 0, 1, 0, minreso - minreso / z);
            let sy = p5.map(Math.random(), 0, 1, 0, minreso - minreso / z);
            let sWidth = minreso / z;
            let sHeight = minreso / z;
            p5.image(
              images[im],
              0,
              0,
              dWidth,
              dHeight,
              sx,
              sy,
              sWidth,
              sHeight
            );
          } else if (zoomType === "best3") {
            // let z = p5.map(Math.random(), 0, 1, 1, maxZoom);
            // let dWidth = minreso / p5.map(Math.random(), 0, 1, 1, maxZoom);
            let dWidth = minreso * p5.map(Math.random(), 0, 1, 1, maxZoom);
            // let dHeight = minreso / p5.map(Math.random(), 0, 1, 1, maxZoom);
            let dHeight = minreso * p5.map(Math.random(), 0, 1, 1, maxZoom);
            let sx = p5.map(
              Math.random(),
              0,
              1,
              0,
              minreso - minreso / p5.map(Math.random(), 0, 1, 1, maxZoom)
            );
            let sy = p5.map(
              Math.random(),
              0,
              1,
              0,
              minreso - minreso / p5.map(Math.random(), 0, 1, 1, maxZoom)
            );
            let sWidth = minreso / p5.map(Math.random(), 0, 1, 1, maxZoom);
            let sHeight = minreso / p5.map(Math.random(), 0, 1, 1, maxZoom);
            p5.image(
              images[im],
              0,
              0,
              dWidth,
              dHeight,
              sx,
              sy,
              sWidth,
              sHeight
            );
          }
        } else {

          p5.image(images[im], 0, 0, minreso, minreso);
          // p5.pop();

          // }
        }
        // p5.pop();
        // console.log('bigi',biggyChance)
        let isBig = p5.map(Math.random(), 0, 1, 0, 100) <= biggyChance;
        if (isBig) {
          // let m = [2, 3, 4, 5, 6,7,8,9];
          p5.push();
          // p5.rotate(-imageRotation);

          let tes = Math.floor(Math.random() * biggyMax) + 1;
          // let tes = Math.floor(p5.map(Math.random(), 0, 1, biggyMin, biggyMax + 1));
          // console.log(tes)
          p5.translate(minreso, minreso);
          p5.image(
            images[im],
            0 - minreso * tes,
            0 - minreso * tes,
            minreso * tes,
            minreso * tes
          );

          p5.pop();
        }
        p5.pop();
        p5.translate(minreso, 0);
        i++;
      }

      p5.translate(minreso * -tilewidth, minreso);
    }

    p5.pop()
   
  }
}
