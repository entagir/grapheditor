// GraphEditor
// Afb.js

// Алгоритм Форда-Беллмана
// Минимальный путь в нагруженном ориентированном графе
function afb(v, w)
{
	if(!env.graph_alg_test().route){ return ; } 

	L = []; C = [];
	
	for(var i in env.graph.vertex)
	{	
		temp = [];
		
		for(var k in env.graph.vertex)
		{
			temp[k] = Infinity;
		}
		
		for(var j in env.graph.edge)
		{			
			if(env.graph.edge[j].v == i){ temp[env.graph.edge[j].w] = env.graph.edge[j].weight; }
			else if((env.graph.edge[j].w == i)&&(env.graph.edge[j].arrow == 0)){ temp[env.graph.edge[j].v] = env.graph.edge[j].weight; }
		}
		
		C[i] = temp;
	}
	
	for(var i in env.graph.vertex)
	{		
		temp = [];
		
		for(var k in env.graph.vertex)
		{
			temp[k] = Infinity;
		}
		
		L[i] = temp;
	}
	
	for(var i in env.graph.vertex)
	{	
		L[v][i] = 0;
	}
	
	for(var i in L)
	{		
		for(var j in env.graph.vertex)
		{
			z = i-1;
			
			for(var g in env.graph.vertex)
			{				
				if(C[g][j] + L[g][z] < L[j][i]){L[j][i] = C[g][j] + L[g][z];}
			}	
		}
	}
	
	for(var i in L)
	{
		if( L[w][i] !== Infinity ){ break; }
		if(isNaN(L[w][i])){break;}
		
		if(i==L.length-1)
		{
			env.graph.vertex[w].state = 5;
			
			env.draw_alt_2();
			
			document.getElementById('message-box').innerHTML = "Путь из вершины " + v + " в вершину " + w  + " не существует.";
			env.graph.new_edge = [];
			env.graph.vertex_clear();
			env.graph.edge_clear();
			
			env.set_mode(-1);
		  
			env.isAfb = true;
			return ;
		}
	}
	
	cw=w; ncw = 0; ne = 0;
	while(cw!=v)
	{
		min = Infinity;
		for(var i in L)
		{			
			if(L[cw][i]<min){ min = L[cw][i]; }	
		}
		
		for(var j in env.graph.edge)
		{			
			if(env.graph.edge[j].w==cw)
			{
				min2 = Infinity;
				for(var i in L)
				{				
					if(L[env.graph.edge[j].v][i]<min2){ min2 = L[env.graph.edge[j].v][i]; }
				}
				
				if(min - env.graph.edge[j].weight == min2)
				{
					 cw = env.graph.edge[j].v;
					 env.graph.edge[j].state = 2;
					 env.graph.new_edge.push(env.graph.edge[j]);
					 env.graph.vertex[ env.graph.edge[j].v ].state = 5;
					 env.graph.vertex[ env.graph.edge[j].w ].state = 5;
					 break; 
				} 
			}
			else if((env.graph.edge[j].v==cw)&&(env.graph.edge[j].arrow == 0))
			{
				min2 = Infinity;
				for(var i in L)
				{					
					if(L[env.graph.edge[j].w][i]<min2){ min2 = L[env.graph.edge[j].w][i]; }
				}
				
				if(min - env.graph.edge[j].weight == min2)
				{
					 cw = env.graph.edge[j].w;
					 env.graph.edge[j].state = 2;
					 env.graph.new_edge.push(env.graph.edge[j]);
					 env.graph.vertex[ env.graph.edge[j].v ].state = 5;
					 env.graph.vertex[ env.graph.edge[j].w ].state = 5;
					 break; 
				} 
			}
		}
	 }
	
	// Вывод
	
	env.draw_alt_2();
	
	env.graph.new_edge = [];
	env.graph.vertex_clear();
	env.graph.edge_clear();
	
	env.set_mode(-1);
  
	env.isAfb = true;
	
	document.getElementById('message-box').innerHTML = "Миниальный путь из вершины " + v + " в вершину " + w  + ".";	
}
