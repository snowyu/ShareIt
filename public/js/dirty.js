$(document).ready(function()
{
	filth = ["\"My God, That\'s Filthy!\"", 
		 	 "\"You Dirty Bastards!\"", 
		     "\"Sheer And Utter Filth!\"", 
		     "\"What a Shame!\"", 
		     ];
	$('#subheader').html('<i>' + filth[Math.floor(Math.random()*filth.length)] + '</i>');
});

$(document).ready(function()
{
    $('#shareurl').html('<b>http://localhost:8000/' + $.url().segment(1) + '</b>');
})