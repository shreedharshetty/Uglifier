var builder = {
	build : function( url ){

			var mkdirp = require( 'mkdirp' ),
			walk = require( 'walk' ),
			fs = require( 'fs' ),
			jsp = require( 'uglify-js' ).parser,
			pro = require( 'uglify-js' ).uglify,
			files   = [],
			htmlfilestouglify = [];
		// Walker options
		var walker  = walk.walk( url , { followLinks: false } );

		walker.on('file', function( root, stat, next ) {
			// Add this file to the list of files
		files.push(root + '/' + stat.name);
		next();
		});

		walker.on( 'end', function() {
			for( var i=0; i<files.length; i++){
			// console.log(files[i]);
				var ext = files[i].split( '.' ).pop();
				if( ext == 'js' ){
					var orig_code = fs.readFileSync( files[i] ).toString(); //read the content of the file
					
					// create directory
					var filenamearray = files[i].split('/'),
						fname = filenamearray.pop( files[i].length-1 ),
						dirlen = filenamearray.length,
						dirname = filenamearray.slice( 0, dirlen ).join('/');
					
					mkdirp.sync('build/'+dirname );
					
					// create file
					fs.open('build/'+dirname+'/'+fname, 'w');

					// uglify the content of the file
					var ast = jsp.parse(orig_code); // parse code and get the initial AST
					ast = pro.ast_mangle(ast); // get a new AST with mangled names
					ast = pro.ast_squeeze(ast); // get an AST with compression optimizations
					var final_code = pro.gen_code(ast);

					// write uglified code into file
					fs.writeFileSync('build/'+dirname+'/'+fname, final_code);
					console.log(files[i] + ' has been uglified and written to build/' + dirname+'/'+fname);
				}
				else if( ext == 'html'){
					htmlfilestouglify.push(files[i]);
				}
			}
		});
	}
};
builder.build("path");
