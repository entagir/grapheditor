// GraphEditor
// Dist.js

// Расстояния в ориентированном графе
function dist()
{
	if(!env.graph_alg_test().dist){ return ; } 
	
	// Вычисление матрицы минимальных расстояний R
	A = []; R = [];
	
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
	
	for(var i in A)
	{
		R[i] = A[i];
	}
	
	for(var k in R)
	{
		m = 0; check = true;
	
		while((m == 0)&&(check == true))
		{
			check = false;
			 
			for(var i in R)
			{		
				if(R[k][i]>0)
				{
					for(var j in R)
					{
						if(j==k){continue;}

						if(R[i][j]>0)
						{
							if( ( R[k][i] + R[i][j] < R[k][j]) && (R[k][j]>0) )
							{
								R[k][j] = R[k][i] + R[i][j];
								check = true;
							}

							else if(R[k][j] == 0)
							{
								R[k][j] = R[k][i] + R[i][j];
								check = true;
							}
						}
					}
				}
			}
			
			m=1;
			
			for(var j in R)
			{					
				if(j==k){continue;}
				
				m*=R[k][j];
			}		
	  }
	}
	
	EX = [];//
	max = 0;
	
	for(var i in A)
	{
		EX[i] = 0;
	}
	
	for(var i in R)
	{
		for(var j in R)
		{
			if(R[i][j]>max){ max = R[i][j]; }
			
			if(R[i][j]>EX[i]){ EX[i] = R[i][j]; }				
		}
	}
	
	str = "";
	str+= "Диаметр: " + max + "\n";

	rad = 1000;
	
	for(var i in EX)
	{
		if(EX[i]<rad){rad = EX[i];}
	}
	
	str+= "Радиус: " + rad + "\n";
	
	str+= "Центры: ";
	
	for(var i in EX)
	{
		if(EX[i]==rad){str+=i+" ";}
	}
	
	env.set_mode(-1);
  
	env.isDist = true;
	
	document.getElementById('message-box').innerHTML = str;
}
