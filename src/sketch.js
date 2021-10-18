const Serialism = require('total-serialism');
const Algo = Serialism.Algorithmic
const Rand = Serialism.Stochastic;
const Gen = Serialism.Generative;

export default function sketch(p5) {
    var images = [];
    let filenames = [];
    let patternList = []
  
    var minreso = 32;
    var tilewidth = 32;
    var tileheight = 32;
    

    var patternType = 'rand';
    var caRule = 0;

    let ww = () => {return minreso * tilewidth}
    let hh = () => {return minreso * tileheight}
  
  
  
    p5.updateWithProps = props => {
      console.log("ALL PROPS", props)
      if (props.filenames) {
        console.log("FILENAMES PROP",props.filenames)      
        filenames = props.filenames
        p5.preload()

      }
      if (props.minRes) {
        // console.log("FILENAMES PROP",props.minRes)      
        minreso = parseInt(props.minRes)
        p5.resizeCanvas(ww(), hh());

      }
      if (props.tileWidth) {
        tilewidth = parseInt(props.tileWidth)

      }
      if (props.tileHeight) {
        tileheight = parseInt(props.tileHeight)

      }
      if (props.patternType) {
        patternType = props.patternType;

      }
      if (props.caRule) {
        caRule = props.caRule
      }
    }
  
    p5.preload = () => {
      images = [];
      let i = 0
      let im;  
    //   console.log(filenames)
      for (im in filenames) {
        images.push( p5.loadImage(filenames[im]));
      }
    }
    
    p5.setup = () =>  {
        
        var canva = p5.createCanvas(ww(), hh());
        canva.id("bgbgbg")
        var button = p5.select('#generatebutton');
        var button2 = p5.select('#saveimage');
  
        button.mousePressed(() => p5.redraw())
        button2.mousePressed(() => p5.saveCanvas(canva, `glicpixpattern_${(new Date().toJSON())}`, 'png'))
        p5.noLoop();
    }
    
    p5.draw = () =>  {
        if (images.length > 1) {
        p5.noSmooth();
        generate();
        // generateAutomata();
        }
    }
  
    class Pattern {
  
      constructor() {
        this.fileName = ""
        this.image = "";
        this.rotation = 0;
        this.flip = 0;
        this.hue = 0;
      }
  
    }
    function initPatternDictionary() {
      let totalImages = tilewidth * tileheight
      patternList = Array.fill(new Pattern())
    }
    
    function generateImageList(patternType) {
      let imageList = []
      let totalTiles = tilewidth * tileheight
    //   console.log("PATTERN TYPE:",patternType)
      switch(patternType) {
        case "ca":
            let n1  = p5.floor(p5.random() * images.length)
            let n2  = p5.floor(p5.random() * images.length)
            while(n2 == n1)
            {
                n2 = p5.floor(p5.random() * images.length)
            }
            let ca = new Algo.Automaton();
            ca.feed(Rand.coin(tilewidth));
            ca.rule(caRule);
            let gens = [];
            for (let i=0; i<tileheight; i++){gens.push(ca.next());}
            // console.log(gens)
            imageList= gens.flat(1).map((item) => {if(item === 0){return n1} else if(item === 1) {return n2}});
          break;
        case "rand":
          for(let i=0; i<totalTiles;i++) {imageList.push(p5.floor(p5.random() * images.length))}
          break;
        case "randrow":
          for (var y = 0; y < tileheight; y++) {
            let rowRand = (p5.floor(p5.random() * images.length))
            for (var x = 0; x < tilewidth; x++) {       
                imageList.push(rowRand);
          }}
          break;
        case "randcol":
          imageList = Array(totalTiles).fill(0)
          for (var x = 0; x < tilewidth; x++) {
            let colRand = (p5.floor(p5.random() * images.length))
            for (var y = 0; y < tileheight; y++) {       
                imageList[ (tilewidth * y) + x ] = colRand;
          }}
          break;
        case "seq":
          for(let i=0; i<totalTiles;i++) {imageList.push(i%images.length)}
          break;
        case "seqPalindrome":
          let sequence = Gen.spread(images.length).concat(Gen.spread(images.length).reverse());
          for(let i=0; i<totalTiles;i++) {
            imageList.push(sequence[i % sequence.length])}
          break;
        case "seqrow":
          for (var y = 0; y < tileheight; y++) {
            let rowSeq = y % images.length
            for (var x = 0; x < tilewidth; x++) {       
                imageList.push(rowSeq);
          }}
          break;
        case "seqcol":
          imageList = Array(totalTiles).fill(0)
          for (var x = 0; x < tilewidth; x++) {
            let colSeq = x % images.length
            for (var y = 0; y < tileheight; y++) {       
                imageList[ (tilewidth * y) + x ] = colSeq;
          }}
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
          let nextNumber = (p5.floor(p5.random() * images.length))
          for(let i=0; i<totalTiles;i++) {
            
            nextNumber = (Rand.coin(1)[0] == 1) ? ((nextNumber + 1) % images.length) : (nextNumber == 0) ? (images.length - 1) : nextNumber-1
            
            imageList.push(nextNumber)
          }
          console.log(imageList)
          break;
        case "single":
          let randImg = (p5.floor(p5.random() * images.length))
          imageList = Array(totalTiles).fill(randImg)
        //   console.log(imageList)
          break;
        default:
          imageList = [0]
  
  
      }
  
      return imageList
    }
  

    function generate() {
        let w = ww()
        let h = hh()
        // console.log(w,h)
        let imageList = generateImageList(patternType);
        // console.log(imageList)
        let im;
        let i = 0
        // p5.tint(p5.random() * 255, p5.random() * 255, p5.random() * 255);

        for (var y = 0; y < h; y = y + minreso) {

          for (var x = 0; x < w; x = x + minreso) {
              p5.push()
              im = imageList[i]
              p5.image(images[im], x, y, minreso, minreso);
              i++
              p5.pop()
        }}
  
    }
  
    
  // }
  };