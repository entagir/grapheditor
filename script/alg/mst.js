// GraphEditor
// Mst.js

// Algorithm minimum spanning tree
// Алгоритм нахождения минимального остовного дерева в связанном взвешенном неориентированном графе
function ost()
 {
	if(!env.graph_alg_test().mts){ return ; } 
	  
	// Выберем в графе G ребро минимальной длины. 
	var min = 1000;var num = -1;
	
	for(var i in env.graph.edge)
    {
		if(env.graph.edge[i].weight < min){min=env.graph.edge[i].weight;num=i;}
	}
	
	env.graph.vertex[env.graph.edge[num].v].select=1; env.graph.vertex[env.graph.edge[num].w].select=1; // Вместе с инцидентными ему двумя вершинами оно образует подграф G2 графа G.
	env.graph.edge[num].state = 2;
	env.graph.new_edge.push(env.graph.edge[num]);
	
	Ver_Count = 2; //Положим i:=2.
	wood = true;
	while( (Ver_Count < env.graph.vertex.length) && wood )
	{
		wood = false;
		min = 1000;num =-1;
		
		for(var i in env.graph.edge)
		{
			if( env.graph.vertex[ env.graph.edge[i].v ].select != env.graph.vertex[ env.graph.edge[i].w ].select )
			{
				if(env.graph.edge[i].weight < min){min=env.graph.edge[i].weight;num=i;}
			}
		}
		
		if(min<1000)
		{
			env.graph.edge[num].state = 2;
			env.graph.new_edge.push(env.graph.edge[num]);
			
			if(env.graph.vertex[ env.graph.edge[num].v ].select == 0){env.graph.vertex[ env.graph.edge[num].v ].select = 1;}
			else if(env.graph.vertex[ env.graph.edge[num].w ].select == 0){env.graph.vertex[ env.graph.edge[num].w ].select = 1;}
				
			Ver_Count++;
				
			wood = true;
		}
	}
	
    // Вывод дерева
	
	env.draw_alt();
	
  	env.graph.new_edge = [];
  	env.graph.vertex_clear();
  	env.graph.edge_clear();
	
	env.set_mode(-1);
	
	env.isOst = true;
	
	document.getElementById('message-box').innerHTML = "Минимальное остовное дерево.";
	
 }
