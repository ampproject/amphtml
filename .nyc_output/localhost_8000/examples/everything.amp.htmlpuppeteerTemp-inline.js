
    body {
      font-family: 'Questrial', Arial;
    }
    article {
      display: block;
      max-width: 736px;
      margin: 8px;
    }

    amp-lightbox {
      background-color: rgba(0, 0, 0, 0.9);
    }

    .bordered {
      border: 1px solid black;
    }

    .box1 {
      border: 1px solid black;
      margin: 8px 0;
    }

    .logo {
      background: yellow;
      border: 5px solid black;
      border-radius: 50%;
      opacity: 0.7;
      position: fixed;
      z-index: 1000;
      top: 0px;
      right: 10px;
      width: 40px;
      height: 40px;
    }

    .ear {
      background: lime;
      border: 5px solid black;
      opacity: 0.7;
      position: absolute;
      z-index: 999;
      top: 0;
      right: 0;
      width: 20px;
      height: 20px;
    }

    @media screen and (min-width: 380px) {
      .logo {
        top: auto;
      }
    }

    @media screen and (min-width: 420px) {
      .logo {
        position: static;
        top: auto;
      }
    }

    .goto {
      display: block;
      margin: 16px;
    }
    @font-face {
      font-family: 'Comic AMP';
      font-style: bold;
      font-weight: 700;
      src: url(fonts/ComicAMP.ttf) format('truetype');
    }
    .comic-amp-font-loaded .comic-amp {
      font-family: 'Comic AMP', serif, sans-serif;
    }

    .comic-amp-font-loading .comic-amp {
      color: #0ff;
    }

    .comic-amp-font-missing .comic-amp {
      color: #f00;
    }

    .lightbox-close-button {
      background: white;
    }

    .lightbox-text {
      color: white;
    }

    #amp-iframe:target {
      border: 1px solid green;
    }

    #breaker {
      height: 100px;
      background: green;
    }

    #breaking {
      height: 200px;
      width: 200vw;
      background: rgba(0, 0, 0, 0.5);
    }


  