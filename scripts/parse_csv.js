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
    generate_table(data);
    
}


var generate_table = (function(){
    var col_indices = {}
    var index = 0;
     
    return function create_table(data){
        
        /* Reset output table */
        document.getElementById('output_table').innerHTML = "";
        
        /* Create table element */
        var table = document.createElement('table');
        table.setAttribute('id','output_table');
        
        
        var header = table.createTHead();
        
        /* Fill table header with column names */
        Object.keys(data[0]).forEach(function(key){
            var col_name = document.createElement("TH");
            col_indices[key] = index++;
            col_name.setAttribute('id', 'col' + index);
            col_name.innerHTML = key;
            var sort_toggle = 1;

            col_name.onclick = function(){
            	sort_toggle *= -1
                sort_by_col(key, col_indices[key], data, sort_toggle);
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
})();




function sort_by_col(col_name, col_index, data, sort_toggle){


	const compare_property_dsc = (value) => 
		(a, b) => a[value] == b[value] ? 0 : a[value] < b[value] ? -1 : 1;

	const compare_property_asc = (value) =>
		(a, b) => a[value] == b[value] ? 0 : a[value] > b[value] ? -1 : 1;

    var table_div = document.getElementById('output_table');
    
    
    var rows = table_div.childNodes[0].rows;
    var num_rows = rows.length;
    var cells, cells_index, num_cells, rows_index, data_type;

    /* Copy table into an array that we can call sort() on */
    table_to_array = new Array();

    /* Fill array with table values */
 	for (rows_index = 0; rows_index < num_rows; rows_index++){
 		/* Get number of cells per row */
 		cells = rows[rows_index].cells;
 		num_cells = cells.length;

 		/* Add cells per row to array */
 		table_to_array[rows_index] = new Array();
 		for (cells_index = 0; cells_index < num_cells; cells_index++){
 			table_to_array[rows_index][cells_index] = cells[cells_index].innerHTML;
 		}

 	}


	if (col_name === 'row_num'){
		sort_toggle == 1 ? table_to_array.sort((a,b) => a[0] - b[0]) : table_to_array.sort((a,b) => b[0] - a[0])
	}else{
	 	sort_toggle == 1 ? table_to_array.sort(compare_property_asc(col_index)) : table_to_array.sort(compare_property_dsc(col_index))

	}

 	for(var i = 0; i < num_rows; i++){
 		for (var j = 0; j < num_cells; j++){
 			rows[i].cells[j].innerHTML = table_to_array[i][j];
 		}
 	}


    
    
}

