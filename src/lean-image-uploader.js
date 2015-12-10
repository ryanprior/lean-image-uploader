import $ from 'jquery';
import cropit from 'cropit';
// get Interface from globals

class LeanImageUploader {
  constructor() {
    this.MAX_CHUNK_SIZE = 25000;
    this.SEND_DELAY = 500;
    this.curr_fileID = null;
  }

  handshake(fileData, f_name) {
    f_name = (f_name !== undefined) ? f_name : '';
    //alert('handshake -- count: ' + chunkCount(fileData));
    $.ajax({
      url: CURR_URL + 'ajax_handshake',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify({
	//csrfmiddlewaretoken: CSRF_TOKEN, // needed for post data... silly django
	filename: 	''/*$("#canvasImg").get(0).filename*/,
	chunk_c: this.chunkCount(fileData),
	
	time: 		Number(new Date())
      })
    })
      .done(function(data, textStatus, jqXHR) {
	// check for errors from host
	if(typeof data['error'] != 'undefined') {
	  alert(data['error']);
	} else {
	  //alert('Success! -- '+data['f_id']);
	  // if available use file data in local storage
	  var ls = this.localStorageAvailable();
	  if ((ls) && (localStorage.getItem('storedImageData')) && (localStorage.getItem('chunkIndex'))) {
	    this.sendData(localStorage.getItem('f_id'),
                          localStorage.getItem('storedImageData'),
                          localStorage.getItem('chunkIndex'),
                          f_name);
	  } else if (ls){
	    localStorage.setItem('f_id', data['f_id']);
	    localStorage.setItem('storedImageData', fileData);
	    localStorage.setItem('chunkIndex', 0);
	    this.sendData(data['f_id'], fileData, 0, f_name);
	  } else {
	    this.sendData(data['f_id'], fileData, 0, f_name);
	  }
	}
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
	alert('Unable to connect to server!\n'+errorThrown)
      });
  }

  sendData(f_id, fileData, idx, f_name) {
    idx = (idx !== undefined) ? idx : 0;
    f_name = (f_name !== undefined) ? f_name : '';
    
    curr_fileID = f_id;
    var chunkData = this.getChunk(fileData, idx);
    
    // update progress bar
    this.updateProgressBar(idx / this.chunkCount(fileData) * 100);
    
    if(chunkData==null) {
      $("#loadingScreen").hide();
      $("#btn_overlay").show();
      $("#uploadFinish_btns").show();
      $("#done").show();
      
      //alert('Done!');
      // clean up
      //cancel(f_id); // -- delete
      if (this.localStorageAvailable()) {
	localStorage.clear();
      }
      return;
    }
    
    $.ajax({
      url: CURR_URL + 'ajax_send',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify({
	time: 		Number(new Date()),
	f_id:		f_id,
	chunk_id: 	idx,
	chunk_c: 	this.chunkCount(fileData),
	filename: 	f_name,
	data:		chunkData
      })
    })
      .done(function(data, textStatus, jqXHR) {
	// check for errors from host
	if(typeof data['error'] != 'undefined') {
	  alert(data['error']);
	} else {
	  //alert('Sent ID: '+idx);
	  if (this.localStorageAvailable()) {
	    // update index in local storage
	    localStorage.setItem('chunkIndex', idx+1);
	  }
          if(SEND_DELAY > 0) {
	    setTimeout(function () {
              this.sendData(f_id, fileData, idx+1);
            }, this.SEND_DELAY);
	  } else {
	    this.sendData(f_id, fileData, idx+1);
	  }
	  //sendData(f_id, fileData, idx+1);
	}
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
	alert('Unable to connect to server!\n'+errorThrown);
	// redo ?
	this.sendData(f_id, fileData, idx, f_name)
      });
  }

  cancel(f_id) {
    $.ajax({
      url: CURR_URL + 'ajax_cancel',
      type: 'POST',
      dataType: 'json',
      data: JSON.stringify({
	time: 		Number(new Date()),
	f_id:		f_id,
      })
    })
      .done(function(data, textStatus, jqXHR) {
	// check for errors from host
	if(typeof data['error'] != 'undefined') {
	  alert(data['error']);
	} else {
	  if (this.localStorageAvailable()) {
	    localStorage.clear();
	  }
	  //alert('File Deleted');
	}
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
	alert('Unable to connect to server!\n'+errorThrown)
      });
  }

  // Calculate number of chunks needed
  chunkCount(fileData) {
    var size = Math.floor(fileData.length/MAX_CHUNK_SIZE);
    if(size*MAX_CHUNK_SIZE < fileData.length) size++;
    return size;
  }

  // Get individual chunk of data
  getChunk(fileData, index) {
    var numChunks = this.chunkCount(fileData);
    
    if (index < numChunks) {
      var c_size 	= MAX_CHUNK_SIZE;
      var s_idx 	= index * c_size;
      var e_idx 	= s_idx + c_size;
      
      if(e_idx >= fileData.length) {
	return fileData.substring(s_idx);
      } else {
	return fileData.substring(s_idx, e_idx);
      }
    } else {
      return null;
    } 
  }

  // Check if local storage is available
  localStorageAvailable() {
    var lsTest = 'lsTest';
    try {
      localStorage.setItem(lsTest, lsTest);
      localStorage.removeItem(lsTest);
      return true;
    } catch (e) {
      return false;
    }
  }

  updateProgressBar(percent) {
    var pBar = $(".progress_bar .bar");
    pBar.css('width', percent + "%");
  }
}

export default LeanImageUploader;
