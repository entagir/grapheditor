// GraphEditor
// Deg.js

// Степени вершин
// Degree
function deg()
{
	if(!env.graph_alg_test().deg){ return ; } 

	D = []; // Степени вершин

	for(var i in env.graph.vertex){ D[i] = 0; }

	for(var i in env.graph.vertex)
	{		
		for(var j in env.graph.edge)
		{			
			if(env.graph.edge[j].arrow == 0)
			{
				if((env.graph.edge[j].v==i)||(env.graph.edge[j].w==i)){ D[i]++; }

				if((env.graph.edge[j].v==i)&&(env.graph.edge[j].w==i)){ D[i]++; }
			}
			else if(env.graph.edge[j].arrow == 1)
			{
				if(env.graph.edge[j].v==i){D[i]++;}
			}
		}	
	}

	// Вывод

	var canva = env.draw_init(); // Инициализация холста

	env.draw_edge(canva, env.graph.edge); // Отрисовка ребер

	lastOnNum = env.onNum;
	env.onNum = false;

	env.draw_vertex(canva); // Отрисовка вершин

	for(var i in env.graph.vertex) // Отрисовка степеней вершин
	{
		vertex = env.def(env.graph.vertex[i].x, env.graph.vertex[i].y);
		
		canva.fillStyle = env.palette.text_deg;
		canva.textBaseline = "middle";
		canva.textAlign = "center";
		canva.font = "bold " + 2*env.baseSize*env.scale + "px Arial";
		canva.fillText(D[i], vertex.x,vertex.y);		
	}

	env.onNum = lastOnNum;

	env.set_mode(-1);

	env.isDeg = true;

	document.getElementById('message-box').innerHTML = "Степени вершин.";
}
