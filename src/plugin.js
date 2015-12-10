import $ from 'jquery';

import LeanImageUploader from './lean-image-uploader';

const methods = {
  init() {
    return this.each(() => {
      if ($.data(this,'lean-image-uploader')) { return; }
      const uploader = new LeanImageUploader();
      $.data(this, 'lean-image-uploader', uploader);

      if(uploader.localStorageAvailable()
         && localStorage.getItem('storedImageData')
         && localStorage.getItem('chunkIndex')) {
        //$('#uploadFound_btns').show();
        
        $(".image-editor").hide();
        
        var f_id = localStorage.getItem('f_id');
        var str64 = localStorage.getItem('storedImageData');
        var idx = parseInt(localStorage.getItem('chunkIndex'));
        
        uploader.updateProgressBar(idx / uploader.chunkCount(str64) * 100);
        
        var load_canvas = document.getElementById("img_result");
        var ctx = load_canvas.getContext("2d");

        var load_image = new Image();
        load_image.onload = function() {
          ctx.drawImage(load_image, 0, 0, load_image.width,    load_image.height,    	// source rectangle
                        0, 0, load_canvas.width, load_canvas.height  		// destination rectangle
                       );
        };
        load_image.src = "data:image/  png;base64," + str64;
        
        $(".btn_export").show();
        $("#loadingScreen").show();
        // start uploading again ...
        
        uploader.sendData(f_id, str64, idx, '');
      } else {
        $('#newUpload').show();
      }

      $(function() {
        $('.image-editor').cropit({
          imageBackground: false,
          imageBackgroundBorderWidth: 0,
          minZoom: 'fill',
          smallImage: 'stretch',
          allowCrossOrigin: false,
          onFileChange: function() {
            $("#btn_overlay").hide();
            $(".btn_export").show();
          }
        });
        
        $('.export_cancel').click(function() {
          /* clear local storage ... */
          if(curr_fileID != null) {
            uploader.cancel(curr_fileID);
          }
          
          location.reload();
          /*
            $("#btn_export").hide();
            $('#newUpload').show();
            $("#btn_overlay").show();
          */
        });
        /**/

        $('#export_accept').click(function() {

          $(".image-editor").hide();
          $("#loadingScreen").show();

          var imageData = $('.image-editor').cropit('export', {
            type: 'image/png',
            originalSize: true
          });

          var sourceImage = new Image();
          sourceImage.src = imageData;

          sourceImage.onload = function() {
            var canvas = window.document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 400;

            // Scale and draw the source image to the canvas
            canvas.getContext("2d").drawImage(sourceImage, 0, 0, canvas.width, canvas.height);

            // Convert the canvas to a data URL in PNG format
            //window.open(canvas.toDataURL());
            var str64 = canvas.toDataURL().replace(/^data:image\/(png|jpg);base64,/, "");
            
            // draw to new canvas ...
            var load_canvas = document.getElementById("img_result");
            var ctx = load_canvas.getContext("2d");

            var load_image = new Image();
            load_image.onload = function() {
              ctx.drawImage(load_image, 0, 0, load_image.width,    load_image.height,    	// source rectangle
                            0, 0, load_canvas.width, load_canvas.height  		// destination rectangle
                           );
            };
            load_image.src = "data:image/  png;base64," + str64;
            
            uploader.handshake(str64);
          }

        });
      });

      
    });
  }
};

$.fn.leanImageUploader = function(method) {
  return methods.init.apply(this)
}
