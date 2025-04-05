// GraphEditor
// El_chain.js

// Алгоритм выделения эйлеровой цепи в связном мультиграфе
// Euler chain Algorithm
// Для неориентированного графа!
function el_chain()
{
	if(!env.graph_alg_test().el_chain){ return ; } 
	
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
	
	col = 0;
	v1=0;v2=0;
	
	for(var i in env.graph.vertex)
	{
		if(D[i]%2 !== 0)
		{
			col++;
			if(col==1){v1=i;}
			else{v2=i;}
		}
	}
	if(col==0){el_cycle();return ;} // Это цикл
	else if(col==2) // Цепь существует
	{
	}
	else // Не существует
	{
		document.getElementById('message-box').innerHTML = "Эйлеровой цепи не существует.";
		return ;
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
	
	S.push(v2);
	str+=v2+" ";
	
	env.graph.new_edge = env.graph.edge.slice(0);
	
	mr = env.graph.new_edge.length;
	
	env.graph.new_edge.push( { v:v1, w:v2, arrow:0, weight:0, state:5} ); // Мнимое ребро
	
	D[v1]++; D[v2]++;
	
	// Находим эйлеров цикл
		
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
						str += env.graph.new_edge[j].w+" ";
					}
					else
					{
						S.push(env.graph.new_edge[j].v);
						str += env.graph.new_edge[j].v+" ";
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
		 if(test==0){break;}
	}
	
	// Удаляем мнимое ребро
	res2 = "";
	for(i=1;i<res.length-2;i++)
	{
		res2 += res[i];
	}
	
	env.graph.new_edge = [];
	document.getElementById('message-box').innerHTML = "Эйлерова цепь: " + res2  + ".";	
}
