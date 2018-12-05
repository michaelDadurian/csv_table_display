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
            
            
            
            /* Populate statistics drop down with column names */
            var select_col_stat = document.getElementById('col_statistic');
            var col_option = document.createElement('option');
            
            
            col_option.text = key;
            col_option.value = index;
            select_col_stat.add(col_option, -1);
            
            /* Populate filter by column drop down with column names */
            var filter_col_input = document.getElementById('col_name_dd');
            var filter_option = document.createElement('option');
            
            filter_option.text = key;
            filter_option.value = index;
            filter_col_input.add(filter_option, -1);
            
            
            
            /* Create column and store column index */
            var col_name = document.createElement("TH");
            col_indices[key] = index++;
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


function get_stats(){
    
    //document.getElementById('stats_table').innerHTML = "";
    
    
    /* Get column index and name that we will generate statistics for */
    var col = document.getElementById('col_statistic');
    var new_stat = 1;
    col.onclick = function(){
        new_stat *= -1;
    }
    
    
    var col_index = col.value;
    var col_text = col[col_index].textContent;
    
    /* Get column value in first table row to figure out data type */
    var table_div = document.getElementById('output_table');
    var rows = table_div.childNodes[0].rows;
    
    var data_type = Number(rows[0].childNodes[col_index].textContent);
    
    /* Initialize statistics variables */
    var sum = 0; 
    var count = rows.length;
    var num_values = 0;
    var min_value, max_value, most_common, least_common;
    var unique_vals = [];
    
    /* Initialize dictionary of counts of column values. Key:col_val Value:count */
    var value_count = {};
    for (var i = 0; i < count; i++){
        var col_val = rows[i].childNodes[col_index].textContent;
        if (col_val != 'undefined')
            value_count[col_val] = 0;
    }
    
    /* If column is a number, calculate the average and sum of all values */
    if (!isNaN(data_type)){
        
        /* Function to calculate sum, average, and count of each value */
        var average = (function(){
            
            for (var i = 0; i < rows.length; i++){
                var col_val = rows[i].childNodes[col_index].textContent;

                if (!isNaN(Number(col_val))){
                    sum += Number(col_val);
                    value_count[col_val] += 1;
                    num_values += 1;
                    
                }
            }
            
            return sum / count;
                
        });
        
        
        average();
    }
    /* Column values are Strings. Store count and number of values */
    else{
        
        for (var i = 0; i < rows.length; i++){
            var col_val = rows[i].childNodes[col_index].textContent;
            if (col_val != 'undefined'){
                value_count[col_val] += 1;
                num_values += 1;
            }
        }
        
        
    }
    
    /* Set statistic values */
    num_unique_vals = Object.keys(value_count).length;
    min_value = Object.keys(value_count).reduce((a,b) => a < b ? a : b);
    max_value = Object.keys(value_count).reduce((a,b) => a > b ? a : b);
    most_common = Object.keys(value_count).reduce((a,b) => value_count[a] > value_count[b] ? a : b);
    least_common = Object.keys(value_count).reduce((a,b) => value_count[a] < value_count[b] ? a : b);
    
    /* Change display based on data type */
    if (!isNaN(data_type)){
        stats_data = {'Count': num_values, 'Range':[min_value, max_value].join('-'), 'Number of Uniques':num_unique_vals, 'Sum':sum, 'Average':average().toFixed(2), 'Most Common':most_common, 'Least Common':least_common};
    }else{
        stats_data = {'Count': num_values, 'Range':[min_value, max_value].join('-'), 'Number of Uniques':num_unique_vals, 'Most Common':most_common, 'Least Common':least_common};
    }
        


        
    /* Create statistics table */
    
    var stats_panel = document.getElementById('statistics_panel');

    /* Reset stats table */
    stats_panel.innerHTML = "";
    
    var stats_table = document.createElement('table');
    var num_stats = Object.keys(stats_data).length;
   
    /* Fill statistics table */
    for (var i = 0; i < num_stats ; i++){

        /* Create table row */
        var row = stats_table.insertRow(-1);
        
        /* Create 2 cells for each row, stat name and stat value */
        var stat_cell = row.insertCell(-1);
        var stat_val_cell = row.insertCell(-1);

        /* Get name of stat and its value */
        var stat_name = Object.keys(stats_data)[i];
        var stat_val = stats_data[Object.keys(stats_data)[i]];

        stat_cell.appendChild(document.createTextNode(stat_name));
        stat_val_cell.appendChild(document.createTextNode(stat_val));
        
    }
        
    /* Add stats table to panel */
    document.getElementById('statistics_panel').appendChild(stats_table);
    
    
    
}

function sort_by_col(col_name, col_index, data, sort_toggle){


	const compare_property_dsc = (value) => 
		(a, b) => a[value] == b[value] ? 0 : a[value] < b[value] ? -1 : 1;

	const compare_property_asc = (value) =>
		(a, b) => a[value] == b[value] ? 0 : a[value] > b[value] ? -1 : 1;

    var table_div = document.getElementById('output_table');
    
    
    var rows = table_div.childNodes[0].rows;
    
    /* Check for filtered rows and sort them */
    var filtered_rows = [];
    for(var i = 0; i < rows.length; i++){
        if (rows[i].style.display === ""){
            filtered_rows.push(rows[i]);
        }
            
    }
    var num_rows = filtered_rows.length;
    var cells, cells_index, num_cells, rows_index, data_type;

    /* Copy table into an array that we can call sort() on */
    table_to_array = new Array();

    /* Fill array with table values */
 	for (rows_index = 0; rows_index < num_rows; rows_index++){
        /* Get number of cells per row */
        cells = filtered_rows[rows_index].cells;
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
 			filtered_rows[i].cells[j].innerHTML = table_to_array[i][j];
 		}
 	}


    
    
}

function filter_table_text(){
    
    var input = document.getElementById('filter_input_text');
    var table = document.getElementById('output_table');
    var table_rows = table.getElementsByTagName('tr');
    
    var filter = input.value.toUpperCase();
    
    for (var i = 0; i < table_rows.length; i++){
        
        if (table_rows[i].textContent.toUpperCase().indexOf(filter) > -1){
            /* Keep row */
            table_rows[i].style.display = "";
        }else{
            /* Do not display row */
            table_rows[i].style.display = "none";
        }
            
    }
        
 
        
    
                
        
}

function regex_filter(){
    var regex_input = RegExp(document.getElementById('regex_input').value, 'i');

    
    var table = document.getElementById('output_table');
    var table_rows = table.getElementsByTagName('tr');
   
    for (var i = 0; i < table_rows.length; i++){
        
        if (regex_input.test(table_rows[i].textContent)){
            /* Do nothing */
            table_rows[i].style.display = "";
        }else{
            /* Revert to default value */
            table_rows[i].style.display = "none";
        }
            
    }
}


function filter_col_val(){
    var col_index = document.getElementById('col_name_dd').value;
    var filter_val = document.getElementById('col_val').value;
    var operator = document.getElementById('col_filter_operator').value;
    
    var table = document.getElementById('output_table');
    var table_rows = table.getElementsByTagName('tr');
    
    var data_type = Number(table_rows[1].cells[col_index].textContent);
    
    for (var i = 0; i < table_rows.length; i++){
        if(filter_val != ""){
            if(compare_vals(operator, table_rows[i].cells[col_index].textContent, filter_val, data_type)){
                table_rows[i].style.display = "";
            }else{
                table_rows[i].style.display = "none";
            }
        }else{
            table_rows[i].style.display = "";
        }
    }
    
        
}

function compare_vals(operator, a, b, data_type){
    if (!isNaN(data_type)){
        a = Number(a);
        b = Number(b);
    }else{
        a = a.toUpperCase();
        b = b.toUpperCase();
    }
    
    switch(operator){
        case '=':
            return a === b;
        case '>':
            return a > b;
        case '<':
            return a < b;
        case '<=':
            return a <= b;
        case '>=':
            return a >= b;
    }
}
        


    
    
    
 
    

