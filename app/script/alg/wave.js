// GraphEditor
// Wawe.js

// Алгоритм фронта волны
// Wave Front Algorithm
function wave(v, w)
{
	if(!env.graph_alg_test().route){ return ; } 
	
	env.graph.vertex[v].select = 1;
	
	k=1;
	on = true;
	while(on)
	{
		for(var j in env.graph.edge)
		{
			if( ( env.graph.vertex[ env.graph.edge[j].v ].select == k )&&( env.graph.vertex[ env.graph.edge[j].w ].select == 0 ) )
			{
				env.graph.vertex[ env.graph.edge[j].w ].select = k+1;
				if(env.graph.edge[j].w == w){ on = false; break; }
			}
			else if( ( env.graph.vertex[ env.graph.edge[j].w ].select == k )&&( env.graph.vertex[ env.graph.edge[j].v ].select == 0 )&&(env.graph.edge[j].arrow == 0) )
			{
				env.graph.vertex[ env.graph.edge[j].v ].select = k+1;
				if(env.graph.edge[j].v == w){ on = false; break; }
			}				
		}
		
		k++;
		
		if(k>env.graph.vertex.length)
		{
			document.getElementById('message-box').innerHTML = "Путь из вершины " + v + " в вершину " + w  + " не существует.";
			env.graph.vertex_clear();
			
			return ;
		}
	}
	
	wx = w;
	
	for(l=k-1;l>=1;l--)
	{
		for(var j in env.graph.edge)
		{
			if( ( env.graph.vertex[ env.graph.edge[j].v ].select == l )&&( env.graph.edge[j].w  == wx ) )
			{
				env.graph.edge[j].state = 2;
				env.graph.new_edge.push(env.graph.edge[j]);
				wx = env.graph.edge[j].v; env.graph.vertex[ env.graph.edge[j].v ].state = 5;
				env.graph.vertex[ env.graph.edge[j].w ].state = 5;
				
				break;
			}
			else if( ( env.graph.vertex[ env.graph.edge[j].w ].select == l )&&( env.graph.edge[j].v  == wx )&&(env.graph.edge[j].arrow == 0) )
			{
				env.graph.edge[j].state = 2;
				env.graph.new_edge.push(env.graph.edge[j]);
				wx = env.graph.edge[j].w;
				env.graph.vertex[ env.graph.edge[j].w ].state = 5;
				env.graph.vertex[ env.graph.edge[j].v ].state = 5;
				
				break;
			}
		}
	}
	
	// Вывод
	
	env.draw_alt_2();
  
	new_edge = [];
	env.graph.vertex_clear();
	env.graph.edge_clear();
	
	env.set_mode(-1);
  
	env.isWave = true;
	
	document.getElementById('message-box').innerHTML = "Миниальный путь из вершины " + v + " в вершину " + w  + ".";
}
