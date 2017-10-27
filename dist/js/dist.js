var barcode = {
  lastResult: null,
  resultCount: 0,
  init: function() {
    Quagga.init({
      inputStream : {
        name : "Live",
        type : "LiveStream",
        target: document.querySelector('#yourElement')    // Or '#yourElement' (optional)
      },
      
      decoder : {
        readers : ["ean_reader"]
      }
    }, function(err) {    
      if (err) {
        console.log(err);
        return
      }
      
      // TODO: add eventlisteners
      barcode.onDetected();
      
      // Debug active track
      var track = Quagga.CameraAccess.getActiveTrack();
      if(track) {
        console.log(`Using track labeled '${track.label}'`);
      }
      
      // populate device list 
      barcode.initCameraSelection();
      
      console.log("Initialization finished. Ready to start");
      
      Quagga.start();
      
      //google.books.load();
    });
  }({ debug: true }),
  
  stop: function() {
    Quagga.stop();
  },
  
  initCameraSelection: function() {
    var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();
    
    return Quagga.CameraAccess.enumerateVideoDevices()
    .then(function(devices) {
      function pruneText(text) {
        return text.length > 30 ? text.substr(0, 30) : text;
      }
      var $deviceSelection = document.getElementById("deviceSelection");
      while ($deviceSelection.firstChild) {
        $deviceSelection.removeChild($deviceSelection.firstChild);
      }
      devices.forEach(function(device) {
        var $option = document.createElement("option");
        $option.value = device.deviceId || device.id;
        $option.appendChild(document.createTextNode(pruneText(device.label || device.deviceId || device.id)));
        $option.selected = streamLabel === device.label;
        $deviceSelection.appendChild($option);
      });
    });
  },
  
  onDetected: function() {
    Quagga.onDetected(function(result) {
      
      var code = result.codeResult.code;
      
      if(barcode.resultCount === 10) {
        console.log('MATCH!');
        return code;
      }
      
      console.log(code);
      
      if(barcode.lastResult !== code){
        barcode.lastResult = code;
        return code;
      }
      
      if (barcode.resultCount !== 10) {
        barcode.resultCount++;
        
        $('#result_strip h1').html(`${barcode.resultCount * 10} %`);
        
        /*            var $node = null, canvas = Quagga.canvas.dom.image;
        
        $node = $('<li><div class="caption"><h4 class="code"></h4></div></div></li>');
        //$node.find("img").attr("src", canvas.toDataURL());
        $node.find("h4.code").html(code);
        $("#result_strip ul.thumbnails").prepend($node);
        */
      }
      return code;
    });   
  },
  
  loadGoogleBookApi: function (isbn) {
    var viewer = new google.books.DefaultViewer(document.getElementById('viewerCanvas'));
    viewer.load(`ISBN:{isbn}`);
    google.books.setOnLoadCallback(initialize);
  }
  
};