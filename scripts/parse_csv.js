/*
    Function to check if FileReader is supported by the browser. If supported, passes the file to get_as_text().
    Accepts a Blob oject.
    
*/
function handle_file(files){
    if (window.FileReader){
        alert('FileReader supported');
        get_as_text(files[0]);
    }else{
        alert('FileReader not supported in this browser');
    }
}

function get_as_text(file){
    var reader = new FileReader();
    /*
        Set handler for load event. Event is triggered each time the reading operation is compelted.
        When reading is complete, pass the CSV file to parse_data.
    */
    reader.onload = function(event){
        /* event.target refers to the CSV file input */
        var csv = event.target.result;
        alert('Parsing data');
        parse_data(csv);
    }
    /*
        Set handler for error event. Event is triggered each time reading operation encounters an error.
        Check for NotReadableError.
    */
    reader.onerror = function(event){
        if(event.target.error.name == 'NotReadableError'){
            alert('Cannot read file');
        }
    }
    /* After handlers are set, read CSV Blob as text.*/
    reader.readAsText(file);
}

function parse_data(csv){
    /* Split on new line. Check for '\r\n' OR '\n' OR '\r' depending on OS */
    var lines = csv.split(/\r\n|\n|\r/);
    var data = [];
    row_num = 0;
    /* 
       First line of file is columns. lines.shift() removes and returns the first element of the list (first line). 
       Split on comma to get the column names. 
    */
    var cols = lines.shift().split(',');
    
    /* Insert row number col */
    cols.unshift("row_num");
    
    /* Shift on the list until there are no lines left to parse */
    while(lines.length > 0){
        /* Get each col val by splitting the row on comma */
        row_vals = lines.shift().split(',');
        /* Add row number value */
        row_vals.unshift(++row_num);
        /* Store column name and value in a dictionary */
        var col_vals = {};
        for (var i = 0; i < cols.length; i++){
            col_vals[cols[i]] = row_vals[i];
        }
        
        data.push(col_vals);
    }
    
    console.log(data);
    create_table(data);
    
}

function create_table(data){
    /* Reset output table */
    document.getElementById('output_table').innerHTML = "";
    var table = document.createElement('table');
    var header = table.insertRow(-1);
    
    /* Create header row containing the column names */
    Object.keys(data[0]).forEach(function(key){
        var col_name = document.createElement("TH");
        col_name.innerHTML = key;
        col_name.onclick = function(){
            sort_by_col(key, data);
        }
        header.appendChild(col_name);
    });
    
    for (var i = 0; i < data.length; i++){
        var row = table.insertRow(-1);
        Object.keys(data[0]).forEach(function(key){
            var data_row = row.insertCell(-1);
            data_row.appendChild(document.createTextNode(data[i][key]));
        });
    }
    
    document.getElementById('output_table').appendChild(table);
}


function sort_by_col(col_name, data){
    var table = document.getElementById('output_table');
    var rows = 0;
    var sorted = false;
    var data_type;
  
    var col_val = data[0][col_name];
   
    /* Try to convert row value to a number. If Number() does not return NaN, we will sort by numerical value. */
    var int_value = Number(col_val);
    if (!isNaN(int_value)){
        data_type = typeof int_value;
    }
    
    /* Check if column is a date object(Assuming the word 'Date' will be present in the column name)*/
    else if (col_name.toUpperCase().includes('date'.toUpperCase())){
        /* data_type = object */
        data_type = typeof new Date();
    }
    /* If it's not a date or a number, sort by string value. */
    else{
        data_type = typeof col_val;
    }
    
    while(!sorted){
        sorted = true;
        
        /*THIS IS THE LINE THAT'S FUCKED UP. ROWS IS UNDEFINED?????*/
        rows = table.rows;
        console.log(rows);
        
        for (var i = 1; i < rows.length; i++){
            curr_row = rows[i].getElementsByTagName('TD')[col_name];
            console.log('curr row: ' + curr_row);
        }
        
    }
    
}

