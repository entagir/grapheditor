// GraphEditor
// Sc.js

// Algorithm strongly connected
// Алгоритм выделения компонент сильной связности
function sc()
{
	if(!env.graph_alg_test().sc){ return ; } 
	
	// Вычисление матрицы сильной связности S
	A = []; T = []; S = [];
	
	for(var i in env.graph.vertex)
	{
		temp = [];
		
		for(var k in env.graph.vertex)
		{
			temp[k] = 0;
		}
		
		for(var j in env.graph.edge)
		{		
			if(env.graph.edge[j].v == i){ temp[env.graph.edge[j].w] = 1; }
		}
		
		A[i] = temp;
	}
	
	TT = [];
	
	for(var i in A)
	{
		T[i] = A[i];
		TT[i] = A[i];
		S[i] = A[i];
	}
	
	for(var i in T) // Диагональ
	{	
		T[i][i] = 1;
	}
	
	
	for(d=0;d<3;d++)
	{
		TX = [];
			
		for(var i in A)
		{
			temp = [];
		
			for(var k in A)
			{
				temp[k] = 0;
			}
		
			for(var j in A)
			{
				for(var k in A)
				{
					if(TT[i][k] * A[k][j] == 1){temp[j] = 1; T[i][j] = 1;}
				}
			}
		
			TX[i] = temp;
		}	
		
		for(var i in TX)
		{		
			TT[i] = TX[i];
		}
	}
	
	for(var i in T)
	{
		for(var j in T)
		{
			S[i][j] = T[i][j] * T[j][i];		
		}
	}
		
	// Поиск компонент сильной связности
	
	V = [];
	
	c = 0;
	
	while(c < env.graph.vertex.length)
	{
		temp = [];

		first = -1;
		
		for(var i in S)
		{
			if(first==-1){ first=i; }
			
			if(S[first][i]==1)
			{
				temp.push(i);
			}
		}
		
		if(temp.length==0){break;}
		
		V.push(temp);
		
		for(i=0;i<V[V.length-1].length;i++)
		{	
			delete S[ V[V.length-1][i] ];
			
			for(var j in S)
			{
				delete S[j][ V[V.length-1][i] ];
			}
		}
		
		c++;
	}
	
	// Определение нужных для вывода ребер
	
	for(i=0;i<V.length;i++)
	{
		if(V[i].length == 1){continue;}
		
		for(var b in env.graph.edge)
		{
			if ( (V[i].indexOf( env.graph.edge[b].v ) != -1) && (V[i].indexOf( env.graph.edge[b].w ) != -1) ) { env.graph.edge[b].state = 2; env.graph.new_edge.push(env.graph.edge[b]); }	
		}

	}
	
	// Вывод

	var canva = env.draw_init(); // Инициализация холста
  
	env.draw_edge(canva, env.graph.new_edge); // Отрисовка ребер

	env.draw_vertex(canva, env.palette.vertex.state1); // Отрисовка вершин
	
	for(i=0;i<V.length;i++) // Отрисовка номера компоненты у вершин
	{
		for(j=0;j<V[i].length;j++)
		{
			vertex = env.def(env.graph.vertex[V[i][j]].x, env.graph.vertex[V[i][j]].y);
			
			canva.fillStyle = env.palette.text;
			canva.textBaseline = "middle";
			canva.textAlign = "center";
			canva.font = "bold " + 2*env.baseSize*env.scale + "px Arial";
			canva.fillText(i, vertex.x, vertex.y - 3*env.baseSize*env.scale);
		}
	}
  
	env.graph.new_edge = [];
	env.graph.edge_clear();

	env.set_mode(-1);

	env.isSc = true;

	document.getElementById('message-box').innerHTML = "Компоненты сильной связности ориентированного графа.";	
}
