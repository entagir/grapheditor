// GraphEditor
// El_cycle.js

// Алгоритм выделения эйлерова цикла в связном мультиграфе
// Euler cycle Algorithm
// Для неориентированного графа!
function el_cycle()
{
	if(!env.graph_alg_test().el_cycle){ return ; } 
	
	env.set_mode(-1);
	env.isEl = true;	
	
	D = []; // Степени вершин
	
	for(var i in env.graph.vertex){ D[i] = 0; }
	
	for(var i in env.graph.vertex)
	{
		for(var j in env.graph.edge)
		{
			if((env.graph.edge[j].v==i)||(env.graph.edge[j].w==i)){ D[i]++; }
			
			if((env.graph.edge[j].v==i)&&(env.graph.edge[j].w==i)){ D[i]++; }
		}	
	}
	
	for(var i in env.graph.vertex)
	{
		if(D[i]%2 !== 0)
		{
			env.graph.new_edge = [];
			document.getElementById('message-box').innerHTML = "Эйлерова цикла не существует.";
			return ;
		}
	}	
	
	var S = [];
	var res = "";
	var str = "";
	for(var i in env.graph.vertex)
	{
		S.push(i);
		str+=i+" ";
		break;
	}
	
	env.graph.new_edge = env.graph.edge.slice(0);
		
	while(true)
	{	
		while(S.length!=0)
		{
			v = S.pop();
			
			for(var j in env.graph.new_edge)
			{
				if((env.graph.new_edge[j].v==v)||(env.graph.new_edge[j].w==v))
				{	
						D[env.graph.new_edge[j].v]--;
						D[env.graph.new_edge[j].w]--;
						
						if(env.graph.new_edge[j].v==v)
						{
							S.push(env.graph.new_edge[j].w);
							str+=env.graph.new_edge[j].w+" ";
						}
						else
						{
							S.push(env.graph.new_edge[j].v);
							str+=env.graph.new_edge[j].v+" ";
						}

					delete env.graph.new_edge[j];
					
					break;
					
				}
			}
		 }
		 
		 if(res=="")
		 {
			res = str;
			str = "";
		 }
		 else // Склеивание циклов
		 {
			temp = ""; 
			for(i=0;i<res.length;i++)
			{
				if((res[i] == str[0])&&(str != "")&&(res[i] != res[i+1]))
				{
					temp+=str;
					str="";
					continue;
				}
				
				temp+=res[i];
			}
			str="";
			res = temp;
		 }
		 
		 test = 0;
		 for(var i in D)
		 {
			test += D[i];
			if(D[i] != 0)
			{
			 S.push(i);
			 str+=i+" ";
			 break;
			}
		 }
		 
		 if(test == 0){break;}
	}

	env.graph.new_edge = [];
	document.getElementById('message-box').innerHTML = "Эйлеров цикл: " + res  + ".";	
}
