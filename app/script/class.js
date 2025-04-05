// GraphEditor
// Class.js

"use strict";

class History // История (список обьектов графа) редактирования
{
	constructor()
	{
		this.list = []; // Список состояний графа
		this.pos = 0; // Текущая позиция в истории
		this.max = 10; // Максимальное количество записей в истории
	}

	write(graph) // Записать состояние графа
	{
		this.list = this.list.slice(0, this.pos+1); // Укоротить list до pos
		let graph_data =
		{
			vertex: JSON.stringify(graph.vertex),
			edge: JSON.stringify(graph.edge),
			vertex_count: graph.vertex_count,
			edge_count: graph.edge_count
		};
		this.list.push(graph_data);
		if(this.list.length > this.max){ this.list = this.list.slice(1, this.list.length); }
		this.pos = this.list.length - 1;
	}

	back() // Откат состояния графа
	{
		if(this.pos==0){return false;}
		this.pos--;
		return this.list[this.pos];
	}

	next() // Вернуть откат
	{
		if(this.pos==this.list.length-1){return false;}
		this.pos++;
		return this.list[this.pos];
	}

	clear() // Очистка истории
	{
		this.list = [];
		this.pos = 0;
	}
}

class Graph // Граф
{
	constructor()
	{
		this.vertex = []; // Коллекция вершин
		this.edge = []; // Коллекция ребер
		this.new_edge = []; // Список ребер для алгоритмов
		this.edge_count = 0; // Количекство вершин
		this.vertex_count = 0; // Количество ребер
		this.history = new History(); // История изменений
		this.name = "Новый граф"; // Название графа

		this.history.write(this); // Записать начальное состояние
	}

	vertex_remove(i,commit=true) // Удалить вершину
	{
		delete this.vertex[i];

		this.vertex_count--;

		for(let j in this.edge)
		{
			if( (this.edge[j].v == i)||(this.edge[j].w == i) )
			{
				delete this.edge[j];
			}
		}

		if(commit){ this.history.write(this); }
	}

	vertex_rename(i, text) // Переименовать вершину
	{
		this.vertex[i].name = text;
		this.history.write(this);
	}

	vertex_clear() // Очистка свойств вершин для функций
	{
		for(let i in this.vertex)
		{	
			this.vertex[i].select = this.vertex[i].state = 0;
		}
	}

	vertex_add(x, y, state=0, select=0, name) // Добавить вершину
	{
		this.vertex.push(new Vertex(x,y,state,select,name));
		this.vertex_count++;
		this.history.write(this);
	}

	edge_remove(i, commit=true) // Удалить ребро
	{
		delete this.edge[i];

		this.edge_count--;

		if(commit){ this.history.write(this); }
	}

	edge_edit(i, weight) // Изменить ребро
	{
		this.edge[i].weight = parseInt(weight);

		this.history.write(this);
	}

	edge_clear() // Очистка свойств ребер
	{
		for(let i in this.edge)
		{
			this.edge[i].state = 0;
			this.edge[i].select = 0;
		}
	}

	edge_add(v, w, ort, weight, state=0) // Добавить ребро
	{
		this.edge.push(new Edge(v,w,ort,weight,state));
		this.edge_count++;
		this.history.write(this);
	}

	move(x, y) // Сдвиг координат вершин графа
	{
		for(let i in this.vertex)
		{
			this.vertex[i].x += x;
			this.vertex[i].y += y;
		}

		this.history.write(this);
	}

	history_back() // Откат графа
	{
		let hgraph = this.history.back();
		if(hgraph)
		{
			this.vertex = JSON.parse(hgraph.vertex);
			this.edge = JSON.parse(hgraph.edge);
			this.vertex_count = hgraph.vertex_count;
			this.edge_count = hgraph.edge_count;

			for(let i in this.vertex){ if(this.vertex[i] == null){ delete(this.vertex[i]); } }
			for(let i in this.edge){ if(this.edge[i] == null){ delete(this.edge[i]); } }

			this.vertex_clear();
			this.edge_clear();
		}
	}

	history_next() // Вернуть откат графа
	{
		let hgraph = this.history.next();
		if(hgraph)
		{
			this.vertex = JSON.parse(hgraph.vertex);
			this.edge = JSON.parse(hgraph.edge);
			this.vertex_count = hgraph.vertex_count;
			this.edge_count = hgraph.edge_count;
			
			for(let i in this.vertex){ if(this.vertex[i] == null){ delete(this.vertex[i]); } }
			for(let i in this.edge){ if(this.edge[i] == null){ delete(this.edge[i]); } }

			this.vertex_clear();
			this.edge_clear();
		}
	}

	get_gml() // Возвращает граф в виде строки формата GML
	{
		//graph

		let gsource = "graph [\n\tcomment \"graph.entagir.xyz\"\n";

		for(let i in this.vertex) // node
		{
			gsource+="\tnode [\n";

			gsource+="\t\tid " + i + "\n";

			gsource+="\t\tx " + this.vertex[i].x + "\n\t\ty " + this.vertex[i].y;

			if(this.vertex[i].name !== undefined){ gsource+="\n\t\tname " + this.vertex[i].name; }

			gsource+="\n";

			gsource+="\t]\n";
		}	

		for(let i in this.edge) // edge
		{	
			gsource+="\tedge [\n";

			gsource+="\t\tsource " + this.edge[i].v + "\n" + "\t\ttarget " + this.edge[i].w + "\n" + "\t\tarrow " + this.edge[i].arrow + "\n" + "\t\tweight " + this.edge[i].weight + "\n";

			gsource+="\t]\n";
		}

		gsource+="]";

		return gsource;
	}

	load_gml(text) // Создать граф из строки формата GML
	{
		/*
		let ntext = "";

		for(let i=0;i<text.length;i++)
		{
			if(text[i] == "\n")
			{
				ntext += "\\n";
			}
			else if(text[i] == "\t")
			{
				ntext += "\\t";
			}
			else
			{
				ntext += text[i];
			}
		}
		

		console.info(ntext);
		*/

		let mas = text.split("\n");

		let key = "";

		let last;

		if(mas[0]=="graph [")
		{
			key = "graph";

			for(let i=1;i<mas.length;i++)
			{
				mas[i] = mas[i].trim();

				if(mas[i]=="node [")
				{
					key = "node";
					continue;
				}

				if(mas[i]=="edge [")
				{
					key = "edge";
					this.edge.push({});
					this.edge_count++;
					
					continue;
				}

				if(mas[i] == "]")
				{
					key = "";
					
					continue;
				}

				if(key == "node")
				{
					let sm = mas[i].split(" ");

					if(sm[0] == "id")
					{
						last = sm[1];
						this.vertex[sm[1]] = {};
						this.vertex_count++;
					}
					else if(sm[0] == "x"){ this.vertex[last].x = parseInt(sm[1]); }
					else if(sm[0] == "y"){ this.vertex[last].y = parseInt(sm[1]); }
					else if(sm[0] == "name"){ this.vertex[last].name = sm[1]; }

					continue;
				}

				if(key == "edge")
				{
					last = this.edge.length-1;

					let sm = mas[i].split(" ");

					if(sm[0] == "source"){ this.edge[last].v = sm[1]; }
					else if(sm[0] == "target"){ this.edge[last].w = sm[1]; }
					else if(sm[0] == "arrow"){ this.edge[last].arrow = sm[1]; }
					else if(sm[0] == "weight"){ this.edge[last].weight = parseInt(sm[1]); }

					continue;
				}
			}

			this.vertex_clear();
		}
	}

	get_matrix_adjacency() // Возвращает матрицу смежности графа
	{
		let matrix = [];

		for(let i in this.vertex)
		{
			let temp = []; // Строка матрицы

			for(var k in this.vertex)
			{
				temp[k] = 0;
			}

			for(let j in this.edge)
			{
				if(this.edge[j].arrow == 0) //
				{
					if((this.edge[j].v == i)||(this.edge[j].w == i))
					{
						if(this.edge[j].v == i)
						{
							temp[this.edge[j].w] = 1;
						}
						else
						{
							temp[this.edge[j].v] = 1;
						}
					}
				}
				else if(this.edge[j].arrow == 1) // 
				{
					if(this.edge[j].v == i)
					{
						temp[this.edge[j].w] = 1;
					}
				}
			}

			matrix.push(temp);
		}

		let str = ""; // Вывод

		for(let i in matrix)
		{	
			for(let j in matrix[i])
			{
				str += matrix[i][j];

				if(j != matrix[i].length-1){ str += " "; }
			}

			str += "<br>";
		}

		if(str != ""){ return str; }
		else{ return "0 x 0"; }
	}

	get_matrix_incidence() // Возвращает матрицу инцидентности графа
	{
		let matrix = [];

		for(let i in this.vertex)
		{
			let temp = []; // Строка матрицы

			for(var k in this.edge)
			{
				temp[k] = 0;
			}

			for(let j in this.edge)
			{
				if(this.edge[j].arrow == 0) //
				{
					if((this.edge[j].v == i)||(this.edge[j].w == i))
					{
						temp[j] = 1;
					}
				}
				else if(this.edge[j].arrow == 1) // 
				{
					if(this.edge[j].v == i)
					{
						temp[j] = 1;
					}
					else if(this.edge[j].w == i)
					{
						temp[j] = -1;
					}
				}
			}

			matrix.push(temp);
		}

		let str = ""; // Вывод

		for(let i in matrix)
		{	
			for(let j in matrix[i])
			{
				str += matrix[i][j];

				if(j != matrix[i].length-1){ str += " "; }
			}

			str += "<br>";
		}

		if(str != "")
		{
			return str;
		}
		else
		{
			return "0 x 0";
		}
	}
}

class Vertex // Вершина
{
	constructor(x, y, state=0, select=0, name=undefined)
	{
		this.x = x;	// Координата x
		this.y = y;	// Координата y
		this.state = state;	// Состояние (цифра)
		this.select = select; // Выбрана ли вершина
		this.name = name; // Название вершины (текст)
	}
}

class Edge // Ребро
{
	constructor(v,w,arrow,weight,state=0,select=0)
	{
		this.v = v; // Номер нчальной вершины
		this.w = w; // Номер конечной вершины
		this.arrow = arrow; // Направленность (0 или 1)
		this.weight = weight; // Вес ребра
		this.state = state; // Состояние (цифра)
		this.select = select; // Выбрана ли вершина
	}
}

class Colors // Цвета (палитра)
{
	constructor(theme_name='standart')
	{
		this.set_theme(theme_name); // Установка одной из предустановленных тем
		
		// Загрузка палитры из хранилища (при наличии сохраненной палитры)
		if(window.localStorage.color_background !== undefined){ this.background = window.localStorage.color_background; }
		if(window.localStorage.color_stroke !== undefined){ this.stroke = window.localStorage.color_stroke; }
		if(window.localStorage.color_text !== undefined){ this.text = window.localStorage.color_text; }
		if(window.localStorage.color_text_deg !== undefined){ this.text_deg = window.localStorage.color_text_deg; }
		if(window.localStorage.color_select !== undefined){ this.select = window.localStorage.color_select; }
		if(window.localStorage.color_select_frame !== undefined){ this.select = window.localStorage.color_select_frame; }
		if(window.localStorage.color_vertex_s0 !== undefined){ this.vertex.state0 = window.localStorage.color_vertex_s0; }
		if(window.localStorage.color_vertex_s1 !== undefined){ this.vertex.state1 = window.localStorage.color_vertex_s1; }
		if(window.localStorage.color_vertex_s2 !== undefined){ this.vertex.state2 = window.localStorage.color_vertex_s2; }
		if(window.localStorage.color_edge_s0 !== undefined){ this.edge.state0 = window.localStorage.color_edge_s0; }
		if(window.localStorage.color_edge_s2 !== undefined){ this.edge.state2 = window.localStorage.color_edge_s2; }
	}

	set_theme(name)
	{
		if(name == 'classic') // Классическая тема
		{
			this.background = "#FFFFFF"; // Цвет фона
			this.stroke = "#4D4D4D"; // Цвет обводки 
			this.text = "#000000"; // Цвет текста 
			this.text_deg = "#000000"; // Цвет текста для алгоритма
			this.select = "rgba(134,194,211,0.5)"; // Цвет рамки выделения
			this.select_frame = "#4A0F98"; // Цвет рамки выделения
			this.vertex = 
			{
				state0: "#FFA500", // Цвет вершины 
				state1: "#0BB70B", // Цвет вершины при отметке 
				state2: "#FFD100" // Цвет вершины при наведении 
			};
			this.edge = 
			{
				state0: "#4D4D4D", // Цвет ребра 
				state2: "#1E90FF"  // Цвет ребра при наведении  
			};
		}
		else // Стандартная тема
		{
			this.background = "#FFFFFF"; // Цвет фона
			this.stroke = "#4D4D4D"; // Цвет обводки 
			this.text = "#000000"; // Цвет текста 
			this.text_deg = "#000000"; // Цвет текста для алгоритма
			this.select = "rgba(134,194,211,0.5)"; // Цвет рамки выделения
			this.select_frame = "#4A0F98"; // Цвет рамки выделения
			this.vertex = 
			{
				state0: "#1a98db", // Цвет вершины 
				state1: "#0bb790", // Цвет вершины при отметке 
				state2: "#19d1e7" // Цвет вершины при наведении 
			};
			this.edge = 
			{
				state0: "#cacaca", // Цвет ребра 
				state2: "#db544b"  // Цвет ребра при наведении  
			};
		}
	}

	reset() // Перезапись хранилища
	{
		window.localStorage.color_background = this.background;
		window.localStorage.color_stroke = this.stroke;
		window.localStorage.color_text = this.text;
		window.localStorage.color_text_deg = this.text_deg; 

		window.localStorage.color_vertex_s0 = this.vertex.state0;
		window.localStorage.color_vertex_s1 = this.vertex.state1;
		window.localStorage.color_vertex_s2 = this.vertex.state2;

		window.localStorage.color_edge_s0 = this.edge.state0;
		window.localStorage.color_edge_s2 = this.edge.state2;
	}
}
