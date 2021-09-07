// GraphEditor
// Environment.js

"use strict";

class Environment // Окружение
{
	version = "1.0a"; // Версия программы CONST
	baseSize = 10; // Размер вершины в пикселах (базовый размер) CONST
	scaleCoef = 1.1; // Коэффициент масштабирования CONST
	
	mode = 0; // 0--вершины, 1--ребра, 2--удаление элеметов, 3--выбор вершин для функции, 4--выбор вершин для функции2, 5--зум, 6--выделение;
	subMode = 0; // 0--захват 1 вершины, 1--захват 2 вершины. Для mode = 1;
	vertexMode = 0; // 0--ставим вершины, 1--навели на вершину, 2--взяли вершину. Для mode = 0;
	
	onDrag = false; // Перемещение камеры
	onDragGraph = false; // Перемещение координат графа
	onContextMenu = false; // Активность контекстного меню
	onContextMenuClosed = false; // После закрытия контекстного меню
	onDialog = false; // Активность диалога
	onMenu = false; // Активность меню
	onMovePlace = false; // Активность инструмента перемещение рабочей области
	onMoveGraph = false; // Активность инструмента перемещение графа
	onZoom = false; // Активность зума(лупы)
	onSelect = false; // Выделение объектов
	onNum = true; // Отображение имен вершин по-умолчанию
	onLiters = false; // Именование вершин по-умолчанию
	
	isOst = false; // Активность функции поиска остовного дерева
	isSc = false; // Активность функции поиска компонент связности
	isDist = false; // Активность функции поиска рассояний
	isWave = false; // Активность функции поиска пути front wave
	isAfb = false; // Активность функции поиска пути afb
	isDeg = false; // Активность функции расчета степени вершин
	isEl = false; // Актиность фунции Эйлерового цикла/цепи
	
	edgeContextKey = false; // Добавление ребра через контекстное меню
	keyLock = false; // Блокировка клавиатуры (для горячих клавиш)
	
	currentVertex; // Номер используемой вершины
	currentVertex2; // Номер используемой вершины 2
	contextVertex; // Номер вершины, выбранной ПКМ
	contextEdge; // Номер ребра, выбранного ПКМ
	contextEvent; // Объект события контекстного меню

	lastMode = 0; // Режим до применения алгоритма
	newArrow = 0; // Тип добавляемого ребра без выбора
	lastCursor = undefined; // Предыдущий курсор
	scale = 1; // Масштаб
	
	keys = {"ctrl":false}; // Нажатые кнопки
		
	selectCoord = {x:0, y:0}; // Точка начала выделения
	selectedObj = {vertex:[], edge:[]}; // Выделенные объеты графа
	selectStop = false; // Ключ для отсановки события клика после окончания выделения

	graphList = []; // Список графов
	graphCharList = []; // Список текущих символов графов (lastCharCode)
	graph; // Текущий граф
	currentGraphNum; // Номер текущего графа
	
	view = {x:0, y:0}; // Смещение камеры
	cursorOffset = { x:0, y:0 } // Смещение курсора относительно центра перетаскиваемой вершины
	canvasOffset = { x:0, y:0 } // Смещение координат рабочей области
	graphOffset = { x:0, y:0 } // Смещение координат графа
	
	palette = new Colors(); // Текущая палитра
	menu = {};
	
	tabs = [];
	contextMenus = [];
	dialogs = [];

	constructor()
	{
		if(window.localStorage.onLiters !== undefined)
		{
			if(window.localStorage.onLiters == 'true')
			{
				this.onLiters = true;
			}
			else
			{
				this.onLiters = false;
			}
		}
		else
		{
			window.localStorage.onLiters = this.onLiters;
		}
		
		if(window.localStorage.onNum !== undefined)
		{
			if(window.localStorage.onNum == 'true')
			{
				this.onNum = true;
			}
			else
			{
				this.onNum = false;
			}
		}
		else
		{
			window.localStorage.onNum = this.onNum;
		}
	}

	// Core

	init() // Инициализация приложения (окружения)
	{
		console.info('grapheditor.ru\nversion ' + this.version);
		
		let obj = this;
		
		let cur = this;
		
		// Menu

		let menu = Tlaloc.menu('menu');
		
		let file = menu.addItem('Файл');
		file.addItem('Создать', function(){cur.new_graph();}, 'N');
		
		let file_temp = file.addItem('Создать из шаблона', function(){cur.import_gml(default_graph[0]);});
		file_temp.addItem('Не нагруженный граф', function(){cur.import_gml(default_graph[2]);});
		file_temp.addItem('Нагруженный граф', function(){cur.import_gml(default_graph[1]);});
		file_temp.addItem('Ориентированный граф', function(){cur.import_gml(default_graph[3]);});
		file_temp.addItem('Нагруженный ориентированный граф', function(){cur.import_gml(default_graph[0]);});
		
		file.addSeparator();
		file.addItem('Открыть...', function(){gload.click();}, 'O');
		file.addItem('Сохранить...', function(){cur.client_save_gml();}, 'S');
		file.addSeparator();
		file.addItem('Переименовать...', function(){cur.rename_dialog();}, 'R');
		file.addSeparator();
		file.addItem('Закрыть', function(){cur.close_graph();}, 'Q');
		file.addItem('Закрыть все', function(){cur.close_all();}, 'W');
		
		let edit = menu.addItem('Правка', function(){cur.graph_editing_test();});
		this.menu.edit_back = edit.addItem('Отменить', function(){cur.editing_back();}, 'Z');
		this.menu.edit_forward =edit.addItem('Вернуть', function(){cur.editing_forward();}, 'Y');
		edit.addSeparator();
		this.menu.edit_delete = edit.addItem('Удалить', function(){cur.delete_selected_obj();}, 'Del');
		edit.addSeparator();
		edit.addItem('Настройки...', function(){cur.dialog_settings();}, 'L');
		
		let view = menu.addItem('Вид');
		let view_name = view.addItem('Названия вершин', function(){cur.vertex_name_visible(this);}, 'M');
		view_name.setCheckable(true);
		view.addSeparator();
		let view_zoom_in = view.addItem('Увеличить', function(){cur.scaling(cur.scaleCoef, gcanv.width/2, gcanv.height/2);}, '+');
		view_zoom_in.setFreeze(true);
		let view_zoom_out = view.addItem('Уменьшить', function(){cur.scaling(1/cur.scaleCoef, gcanv.width/2, gcanv.height/2);}, '-');
		view_zoom_out.setFreeze(true);
		view.addItem('В обычном размере', function(){cur.scaling(false);}, '0');
		
		let alg = menu.addItem('Алгоритмы', function(){cur.graph_alg_test();});
		this.menu.alg_sc = alg.addItem('Компоненты сильной связности', function(){sc();});
		this.menu.alg_dist = alg.addItem('Расстояния в ориентированном графе', function(){dist();});
		this.menu.alg_route = alg.addItem('Поиск минимального пути', function(){cur.graph_alg_route_test();});
		this.menu.alg_el_cycle = alg.addItem('Эйлеров цикл', function(){el_cycle();});
		this.menu.alg_el_chain = alg.addItem('Эйлерова цепь', function(){el_chain();});
		this.menu.alg_ost = alg.addItem('Поиск минимального остовного дерева', function(){ost();});
		this.menu.alg_deg = alg.addItem('Степени вершин', function(){deg();});

		let tools = menu.addItem('Инструменты');
		tools.addItem('Сохранить изображение...', function(){cur.dialog_save_image();});
		tools.addSeparator();
		this.menu.tool_loupe = tools.addItem('Лупа', function(){cur.tool_loupe();});
		this.menu.tool_loupe.setCheckable(true);
		this.menu.tool_move_place = tools.addItem('Перемещение рабочей области', function(){cur.tool_move_place();});
		this.menu.tool_move_place.setCheckable(true);
		this.menu.tool_move_graph = tools.addItem('Перемещение графа', function(){cur.tool_move_graph();});
		this.menu.tool_move_graph.setCheckable(true);
		tools.addSeparator();
		let tools_matrix = tools.addItem('Матрицы');
		tools_matrix.addItem('Матрица смежности...', function(){cur.dialog_matrix_adjacency();});
		tools_matrix.addItem('Матрица инцидентности...', function(){cur.dialog_matrix_incidence();});
		
		let mode = menu.addItem('Режим');
		this.menu.mode_vertex = mode.addItem('Режим вершин', function(){cur.set_mode(0);}, 'V');
		this.menu.mode_vertex.setCheckable(true);
		this.menu.mode_edge = mode.addItem('Режим ребер', function(){cur.set_mode(1);}, 'E');
		this.menu.mode_edge.setCheckable(true);
		this.menu.mode_delete = mode.addItem('Удалить', function(){cur.set_mode(2);}, 'D');
		this.menu.mode_delete.setCheckable(true);
		this.menu.mode_select = mode.addItem('Выделить', function(){cur.set_mode(6);}, 'C');
		this.menu.mode_select.setCheckable(true);
		
		let help = menu.addItem('Справка');
		help.addItem('Справка', function(){window.open('help.html');});
		help.addItem('О программе...', function(){cur.dialog_show('about');});
		
		// Tabs
		
		this.tab_bar = Tlaloc.tabs('tabs');
		
		// Context Menu
		
		let cmenu_vertex = Tlaloc.contextMenu('gcanv', function(e){cur.canvas_context_menu(e);});
		cmenu_vertex.addItem('Переименовать...', function(){cur.vertex_rename_dialog(); cur.canvas_mouse_move(event);});
		cmenu_vertex.addItem('Удалить', function(){cur.graph.vertex_remove(cur.contextVertex); cur.canvas_mouse_move(event);});
		cmenu_vertex.addItem('Добавить ребро', function(){cur.add_edge_start(); cur.canvas_mouse_move(event);});
		this.contextMenus['vertex'] = cmenu_vertex;
		
		let cmenu_edge = Tlaloc.contextMenu('gcanv', function(e){cur.canvas_context_menu(e);});
		cmenu_edge.addItem('Изменить...', function(){cur.dialog_edge_edit(); cur.canvas_mouse_move(event);});
		cmenu_edge.addItem('Удалить', function(){cur.graph.edge_remove(env.contextEdge); cur.canvas_mouse_move(event);});
		this.contextMenus['edge'] = cmenu_edge;
		
		let cmenu_canvas = Tlaloc.contextMenu('gcanv', function(e){cur.canvas_context_menu(e);});
		cmenu_canvas.addItem('Добавить вершину здесь', function(){cur.add_vertex(env.contextEvent.offsetX, env.contextEvent.offsetY); cur.canvas_mouse_move(event);});
		cmenu_canvas.addItem('Сохранить изображение...', function(){cur.dialog_save_image(); cur.canvas_mouse_move(event);});
		this.contextMenus['canvas'] = cmenu_canvas;
		
		// Dialogs
		
		this.dialogs['edge'] = Tlaloc.dialog('dialog-edge', 'Добавить ребро');
		this.dialogs['save'] = Tlaloc.dialog('dialog-save', 'Сохранить граф');
		this.dialogs['image_save'] = Tlaloc.dialog('dialog-image-save', 'Сохранить изображение');
		this.dialogs['matrix'] = Tlaloc.dialog('dialog-matrix');
		this.dialogs['vertex_rename'] = Tlaloc.dialog('dialog-vertex-rename', 'Переименовать вершину');
		this.dialogs['edge_edit'] = Tlaloc.dialog('dialog-edge-edit', 'Изменить ребро');
		this.dialogs['settings'] = Tlaloc.dialog('dialog-settings', 'Настройки');
		this.dialogs['rename'] = Tlaloc.dialog('dialog-rename', 'Переименовать граф');
		this.dialogs['about'] = Tlaloc.dialog('dialog-about', 'О программе');
		
		let gcanv = document.getElementById('gcanv'); 

		gcanv.width = gcanv.clientWidth;

		gcanv.height = gcanv.clientHeight;

		this.change_title('Новый граф');

		isave.value = '';

		gcanv.addEventListener('click', function(event){ obj.canvas_click(event); }, false); // Обработчик события click на холсте
		
		gcanv.addEventListener('mousemove', function(event){ obj.canvas_mouse_move(event); }, false); // Обработчик события mousemove на холсте
		
		gcanv.addEventListener('mousedown', function(event){ obj.canvas_mouse_down(event); }, false); // Обработчик события mousedown на холсте
		
		gcanv.addEventListener('mouseup', function(event){ obj.canvas_mouse_up(event); }, false); // Обработчик события mouseup на холсте

		gcanv.addEventListener('contextmenu', function(event){ obj.canvas_context_menu(event); event.preventDefault(); }, false); // Обработчик события contextmenu на холсте

		gcanv.addEventListener('wheel', function(event){ obj.canvas_wheel(event); }, false); // Обработчик события wheel на холсте
		
		document.body.addEventListener('keydown', function(event){ obj.body_key_down(event); }, false); // Обработчик события keydown на теле
		
		document.body.addEventListener('keyup', function(event){ obj.body_key_up(event); }, false); // Обработчик события keyup на теле

		document.body.addEventListener('click', function(event){ obj.body_click(event); }, false); // Обработчик события click на теле
		
		// Для загрузки графа с клиента...
		gload.addEventListener('change', function(event) { reader.readAsText(gload.files[0]); }, false);

		let reader = new FileReader();
		reader.onload = function(event)
		{
			let contents = event.target.result;
			let ext = gload.files[0].name.split('.')[1]; // Расширение файла
			if(ext == 'gml'){ obj.import_gml(contents); } // Генерация графа из загруженного файла gml
		};

		reader.onerror = function(event)
		{
			console.error('Файл не может быть прочитан! код ' + event.target.error.code);
		};
		// ...Для загрузки графа с клиента

		this.onZoom = true;
		this.tool_loupe(); // Отключение лупы

		this.onMovePlace = true;
		this.tool_move_place();

		this.onMoveGraph = true;
		this.tool_move_graph();
		
		view_name.setCheck(this.onNum);

		gcanv.style.cursor = 'default';

		document.getElementById('dialog-about-version').innerHTML = 'v ' + this.version;

		this.set_mode(0);

		this.new_graph();

		this.draw();
	}

	canvas_click(event) // Обработчик события click на холсте
	{
		if(this.graphCharList[this.currentGraphNum] === undefined)
		{
			this.graphCharList[this.currentGraphNum] = 65;
		}
		else if(this.graphCharList[this.currentGraphNum] > 90)
		{
			this.graphCharList[this.currentGraphNum] = 65;
		}
		
		if(this.onContextMenuClosed)
		{
			this.onContextMenuClosed = false;
			
			return false;
		}

		if((this.onContextMenu)||(this.onMenu)||(this.onMovePlace)||(this.onMoveGraph))
		{
			return false;
		}

		if(this.mode == -1)
		{
			this.set_mode(this.lastMode);
			
			return;
		}

		let x = event.offsetX;
		let y = event.offsetY;

		if(this.onZoom) // Зум
		{
			this.scaling(this.onZoom, x, y);

			return;
		}

		if(this.mode == 0) // Добавление вершины
		{
			if(this.vertexMode == 0)
			{
				if(this.collision(x, y))
				{
					this.add_vertex(event.offsetX, event.offsetY);
				}
			}
			
			this.draw();
		}

		if((this.mode == 1)||(this.mode == 3)||(this.mode == 4))
		{		 
			let t = false;
			
			for(let i in this.graph.vertex)
			{				
				if( this.cursor_over_vertex(i, event) )
				{
					t = true;

					if(this.subMode==0)
					{
						this.graph.vertex[i].state = 1;
						this.currentVertex = i; // Номер выбраной вершины
						
						if(this.mode == 1)
						{
							gcanv.style.cursor = 'crosshair';
						}
						if((this.mode == 3)||(this.mode == 4))
						{
							gcanv.style.cursor = 'default';
						}
						
						this.subMode = 1;
					}				
					else if(this.subMode == 1)
					{
						if(this.mode == 3)
						{
							this.currentVertex2 = i;
							wave(this.currentVertex ,i);
							this.subMode = 0;
							this.graph.vertex[this.currentVertex].state = 0;
							
							gcanv.style.cursor = 'default';

							return;
						}
						if(this.mode == 4)
						{
							this.currentVertex2 = i;
							afb(this.currentVertex ,i);
							this.subMode = 0;
							this.graph.vertex[this.currentVertex].state = 0;
							gcanv.style.cursor = 'default';

							return;
						}

						// Проверка на возможность добавления ребра...
						let only_arrow = false;
						
						for(let j in this.graph.edge)
						{
							if((this.graph.edge[j].v == i)&&(this.graph.edge[j].w == this.currentVertex)&&(this.graph.edge[j].arrow == 1))
							{
								only_arrow = true;
							}

							if( ((this.graph.edge[j].v == this.currentVertex)&&(this.graph.edge[j].w == i)) || ((this.graph.edge[j].v == i)&&(this.graph.edge[j].w == this.currentVertex)&&(this.graph.edge[j].arrow == 0)) )
							{
								this.subMode = 0;
								this.mode = this.lastMode;
								this.vertexMode = 0;
								this.graph.vertex[this.currentVertex].state = 0;
								
								gcanv.style.cursor = 'pointer';
								
								this.draw();
								
								return;
							}
						}
						// ...Проверка на возможность добавления ребра

						this.dialogs['edge'].show();

						if((this.currentVertex == i)||(only_arrow)) // Если добавляем петлю или Если уже имеется направленное ребро
						{
							if(only_arrow) // Если уже имеется направленное ребро
							{
								this.newArrow = 1;
							}
							else if(this.currentVertex == i) // Если добавляем петлю
							{
								this.newArrow = 0;
							}

							document.getElementById('control-but').style.display = 'none';
							document.getElementById('extra-but').style.display = 'block';	
						}
						else
						{
							document.getElementById('extra-but').onclick = 'add_edge(0)';
							document.getElementById('control-but').style.display = 'block';
							document.getElementById('extra-but').style.display = 'none';
						}

						this.currentVertex2 = i;
					}

					break;
				}
			}

			if((!t)&&(this.subMode == 1))
			{
				this.subMode = 0;
				this.graph.vertex[this.currentVertex].state = 0;
				this.set_mode(this.lastMode);
				
				gcanv.style.cursor = 'default';
			}
			
			this.draw();
		}

		if(this.mode == 2) // Режим удаления
		{
			for(let i in this.graph.vertex)
			{		
				if(this. cursor_over_vertex(i, event) )
				{
					this.graph.vertex_remove(i);

					return;
				}
			}

			for(let j in this.graph.edge)
			{
				if( this.cursor_over_edge(j, event) )
				{
					this.graph.edge_remove(j);

					return;
				}
			}

			this.draw();
		}

		if(this.mode == 6) // Режим выделения
		{
			if(this.selectStop)
			{
				this.selectStop = false;

				return;
			}
			
			for(let i in this.graph.vertex)
			{
				if( this.cursor_over_vertex(i, event) )
				{	
					if(!this.keys['ctrl'])
					{
						this.graph.vertex_clear();
						this.graph.edge_clear();
						this.selectedObj.vertex = [];
						this.selectedObj.edge = [];
						this.graph.vertex[i].select = 1;
						this.selectedObj.vertex.push(parseInt(i));
					}
					else
					{
						if(this.graph.vertex[i].select == 0)
						{
							this.graph.vertex[i].select = 1;
							this.selectedObj.vertex.push(parseInt(i));
						}
						else if(this.graph.vertex[i].select == 1)
						{
							this.graph.vertex[i].select = 0;
							this.selectedObj.vertex.splice(this.selectedObj.vertex.indexOf(parseInt(i)), 1);
						}
					}

					this.draw();
					
					return;
				}
			}

			for(let i in this.graph.edge)
			{
				if( this.cursor_over_edge(i, event) )
				{
					if(!this.keys['ctrl'])
					{
						this.graph.vertex_clear();
						this.graph.edge_clear();
						this.selectedObj.vertex = [];
						this.selectedObj.edge = [];
						this.graph.edge[i].select = 1;
						this.selectedObj.edge.push(parseInt(i));
					}
					else
					{
						if(this.graph.edge[i].select == 0)
						{
							this.graph.edge[i].select = 1;
							this.selectedObj.edge.push(parseInt(i));
						}
						else if(this.graph.edge[i].select == 1)
						{
							this.graph.edge[i].select = 0;
							this.selectedObj.edge.splice(this.selectedObj.edge.indexOf(parseInt(i)),1);
						}
					}

					this.draw();
					
					return;
				}
			}
		}
	}

	canvas_context_menu(event) // Обработчик события contextmenu на холсте
	{
		if((this.onContextMenu)||(this.vertexMode == 2))
		{
			return false;
		}
		
		this.canvas_mouse_move(event);
		
		if(this.alg_is_active())
		{
			return;
		}

		for(let i in this.graph.vertex) // Проверка на меню для вершин
		{
			if( this.cursor_over_vertex(i, event) )
			{
				this.contextMenus['vertex']._show(event);

				this.contextVertex = i;

				return;
			}
		}

		for(let j in this.graph.edge) // Проверка на меню для ребер
		{
			if( this.cursor_over_edge(j, event) )
			{
				this.contextMenus['edge']._show(event);

				this.contextEdge = j;

				return;
			}
		}

		this.contextEvent = event;

		this.contextMenus['canvas']._show(event); // Отобразить меню для холста (при клике на пустое место)
	}

	canvas_mouse_move(event) // Обработчик события mousemove на холсте
	{
		if(this.onContextMenu){ return false; } 

		let x = event.offsetX;
		let y = event.offsetY;

		if(this.onDrag) // Перемещение координат рабочей области
		{
			this.camera_shift((x - this.canvasOffset.x)/this.scale, (y - this.canvasOffset.y)/this.scale);

			this.canvasOffset.x = x;
			this.canvasOffset.y = y;

			this.draw();

			return ;
		}

		if(this.onDragGraph) // Перемещение координат графа
		{
			this.graph.move((x - this.graphOffset.x)/this.scale, (y - this.graphOffset.y)/this.scale);

			this.graphOffset.x = x;
			this.graphOffset.y = y;

			this.draw();

			return ;
		}

		if( (this.onZoom)||(this.onMovePlace)||(this.onMoveGraph) ){ return ; }

		if(this.onSelect) // Выделение элементов
		{
			this.draw();
			this.draw_frame(this.selectCoord.x, this.selectCoord.y, x, y);
			
			return ;
		}

		if(this.mode == 0) // Режим вершин
		{
			if((this.vertexMode == 0)||(this.vertexMode == 1)) // Если ставим вершины или навели на вершину
			{
				let onFind = false;
				
				for(let i in this.graph.vertex)
				{
					this.graph.vertex[i].state = 0;
				}
				
				for(let i in this.graph.vertex)
				{
					if( this.cursor_over_vertex(i, event) )
					{
						gcanv.style.cursor = 'pointer';
						
						this.vertexMode = 1;
						this.graph.vertex[i].state = 2;
						
						onFind = true;
						
						break;
					}
				}
				
				if(!onFind)
				{
					gcanv.style.cursor = 'default';

					this.vertexMode = 0;
				}
			}
			else if(this.vertexMode == 2) // Если двигаем вершину
			{
				let dot = this.undef(event.offsetX, event.offsetY);

				if(this.collision(dot.x - this.cursorOffset.x, dot.y - this.cursorOffset.y))
				{
					this.graph.vertex[this.currentVertex].x = dot.x - this.cursorOffset.x;
					this.graph.vertex[this.currentVertex].y = dot.y - this.cursorOffset.y;
				}
			}

			this.draw();
		}
		else if((this.mode == 1)||(this.mode == 3)||(this.mode == 4)) // Режим ребер
		{
			if(this.subMode == 0) // Режим выделения 1 вершины
			{
				for(let i in this.graph.vertex)
				{			
					if( this.cursor_over_vertex(i, event) )
					{
						gcanv.style.cursor = 'pointer';
						this.graph.vertex[i].state = 2;
						
						break;
					}
					else
					{
						gcanv.style.cursor = 'default';
						this.graph.vertex[i].state = 0;
					}
				}
			}
			else if(this.subMode == 1) // Режим выделения 2 вершины (создания ребра)
			{
				for(let i in this.graph.vertex)
				{				
					if( this.cursor_over_vertex(i, event) )
					{
						if((this.mode == 3)||(this.mode == 4))
						{
							gcanv.style.cursor = 'pointer';
						}

						if(this.graph.vertex[i].state != 1)
						{
							this.graph.vertex[i].state = 2;
						}
						
						break;
					}
					else
					{
						if(this.graph.vertex[i].state != 1)
						{
							this.graph.vertex[i].state = 0;
						}
						if((this.mode == 3)||(this.mode == 4))
						{
							gcanv.style.cursor = 'default';
						}
					}
				}
			}
			
			this.draw();
		}
		else if(this.mode == 2) // Режим удаления
		{
			for(let i in this.graph.vertex)
			{				
				if( this.cursor_over_vertex(i, event) )
				{
					gcanv.style.cursor = 'pointer';
					this.graph.vertex_clear();
					this.graph.edge_clear();
					this.graph.vertex[i].state = 2;
					
					this.draw();
					
					return ;
				}
			}

			for(let j in this.graph.edge)
			{
				if( this.cursor_over_edge(j, event) )
				{
					gcanv.style.cursor = 'pointer';
					this.graph.vertex_clear();
					this.graph.edge_clear();
					this.graph.edge[j].state = 2;
					
					this.draw();
					
					return ;
				}
			}

			this.graph.vertex_clear();
			this.graph.edge_clear();

			gcanv.style.cursor = 'default';

			this.draw();
		}
		else if(this.mode == 6) // Режим выделения
		{
			for(let i in this.graph.vertex)
			{
				if( this.cursor_over_vertex(i, event) )
				{
					gcanv.style.cursor = 'pointer';
					if(this.graph.vertex[i].select == 0)
					{
						this.graph.vertex[i].state = 2;
					}
					
					this.draw();
					
					return;
				}
				else
				{
					this.graph.vertex[i].state = 0;
				}
			}

			gcanv.style.cursor = 'default';

			this.draw();
		}
	}

	canvas_mouse_up(event) // Обработчик события mouseup на холсте
	{
		if(this.onContextMenuClosed)
		{
			this.onContextMenuClosed = false;
			
			this.canvas_mouse_move(event);
			
			return false;
		}

		if((this.onContextMenu)||(event.which == 3)||(this.onMenu))
		{
			return false;
		}
		
		this.canvas_mouse_move(event);

		let x = event.offsetX;
		let y = event.offsetY;

		if(this.onDrag) // Перемещение координат рабочей области
		{
			this.onDrag = false;
			
			if(this.onZoom)
			{
				gcanv.style.cursor = this.lastCursor;
			}
			else if(!this.onMoveGraph && !this.onMovePlace)
			{
				gcanv.style.cursor = 'default';
			}
			else
			{
				gcanv.style.cursor = 'pointer';
			}
			
			this.canvas_mouse_move(event);
			
			return;
		}

		if(this.onDragGraph) // Перемещение координат графа
		{
			this.onDragGraph = false;
			
			if(this.onZoom)
			{
				gcanv.style.cursor = this.lastCursor;
			}
			else if(!this.onMoveGraph && !this.onMovePlace)
			{
				gcanv.style.cursor = 'default';
			}
			else
			{
				gcanv.style.cursor = 'pointer';
			}
			
			this.canvas_mouse_move(event);
			
			return;
		}

		if(this.onZoom)
		{
			return;
		}

		if(this.onSelect) // Выделение рамкой
		{
			let vertexBuffer = 1.5 * this.baseSize * this.scale;

			let frame =
			{
				x1: this.selectCoord.x,
				y1: this.selectCoord.y,
				x2: x,
				y2: this.selectCoord.y,
				x3: x,
				y3: y,
				x4: this.selectCoord.x,
				y4: y
			};
			
			for(let i in this.graph.vertex)
			{
				let vertex_on_canvas = this.def(this.graph.vertex[i].x, this.graph.vertex[i].y);

				if(this.selectCoord.x < x)
				{
					if(!(vertex_on_canvas.x + vertexBuffer >= this.selectCoord.x && vertex_on_canvas.x - vertexBuffer <= x)){ continue; }
				}
				else
				{
					if(!(vertex_on_canvas.x + vertexBuffer >= x && vertex_on_canvas.x - vertexBuffer <= this.selectCoord.x)){ continue; }
				}

				if(this.selectCoord.y < y)
				{
					if(!(vertex_on_canvas.y + vertexBuffer >= this.selectCoord.y && vertex_on_canvas.y - vertexBuffer <= y)){ continue; }
				}
				else
				{
					if(!(vertex_on_canvas.y + vertexBuffer >= y && vertex_on_canvas.y - vertexBuffer <= this.selectCoord.y)){ continue; }
				}

				if(this.graph.vertex[i].select == 0)
				{
					this.graph.vertex[i].select = 1;
					
					this.selectedObj.vertex.push(parseInt(i));
				}
				else if(this.graph.vertex[i].select == 1) // Если элемент уже выделен
				{
					this.graph.vertex[i].select = 0; // Снять выделение
					
					this.selectedObj.vertex.splice(this.selectedObj.vertex.indexOf(i), 1); // Удалить элемент из выделенных
				}
			}

			for(let i in this.graph.edge)
			{
				let v_on_canvas = this.def(this.graph.vertex[this.graph.edge[i].v].x, this.graph.vertex[this.graph.edge[i].v].y);
				let w_on_canvas = this.def(this.graph.vertex[this.graph.edge[i].w].x, this.graph.vertex[this.graph.edge[i].w].y);
			}

			this.selectStop = true;
			this.onSelect = false;
			
			return false;
		}

		if(this.mode == 0)
		{
			if((this.vertexMode == 1)||(this.vertexMode == 2))
			{	
				this.vertexMode = 1;
				
				gcanv.style.cursor = 'pointer';
			}
		}
	}

	canvas_mouse_down(event) // Обработчик события mousedown на холсте
	{
		if((this.onContextMenu)||(event.which == 3)||(this.onMenu)||(this.onSelect))
		{
			return false;
		}

		let x = event.offsetX;
		let y = event.offsetY;

		if( (event.which == 2)||((event.which == 1)&&(this.onMovePlace)) )
		{
			this.onDrag = true;
			
			this.canvasOffset.x = x;
			this.canvasOffset.y = y;
			this.lastCursor = gcanv.style.cursor;
			
			gcanv.style.cursor = 'move';
			
			return;
		}

		if((event.which == 1)&&(this.onMoveGraph))
		{
			this.onDragGraph = true;
			
			this.graphOffset.x = x;
			this.graphOffset.y = y;
			this.lastCursor = gcanv.style.cursor;
			
			gcanv.style.cursor = 'move';
			
			return;
		}

		if(this.onZoom)
		{
			return false;
		}

		if(this.mode == 0)
		{
			for(let i in this.graph.vertex)
			{		
				if( this.cursor_over_vertex(i, event) )
				{
					if((this.vertexMode == 1)||(this.vertexMode == 2))
					{
						let dot = this.undef(event.offsetX, event.offsetY);

						gcanv.style.cursor = 'move';
						
						this.vertexMode = 2;
						this.currentVertex = i;
						this.cursorOffset.x = dot.x - this.graph.vertex[i].x;
						this.cursorOffset.y = dot.y - this.graph.vertex[i].y;
						
						break;
					}	
				}
			}	
		}

		if((this.mode == 6)&&(event.which == 1))
		{
			let place = true;

			for(let i in this.graph.vertex)
			{
				if( this.cursor_over_vertex(i, event) )
				{
					place = false;
					
					break;
				}
			}

			for(let i in this.graph.edge)
			{
				if( this.cursor_over_edge(i, event) )
				{
					place = false;
					
					break;
				}
			}

			if(place)
			{
				this.onSelect = true;
				
				this.selectCoord.x = x;
				this.selectCoord.y = y;
				
				if(!this.keys['ctrl'])
				{
					this.graph.vertex_clear();
					this.graph.edge_clear();
					
					this.selectedObj.vertex = [];
				}
			}
		}
	}

	canvas_wheel(event) // Обработчик события wheel на холсте
	{
		let x = event.offsetX;
		let y = event.offsetY;

		let koef = Math.abs(event.deltaY / 53 * this.scaleCoef);

		if(event.deltaY < 0)
		{
			this.scaling(koef, x, y);
		}
		else if(event.deltaY > 0)
		{
			this.scaling(1/koef, x, y);
		}
	}

	body_key_down(event) // Нажатие кнопки клавиатуры
	{
		if(this.onDialog || this.onContextMenu)
		{
			return;
		}

		this.keyLock = true;
		
		if(event.ctrlKey || event.metaKey) // Ctrl или Cmd
		{
			this.keys['ctrl'] = true;

			if(this.onZoom) // Меняем состояние лупы на -
			{
				this.tool_loupe_change(false);
			}
		}

		// Горячие клавиши

		// Файл

		if(event.code == 'KeyN') // N - Новый граф
		{
			this.new_graph();

			event.preventDefault();
			
			return false;
		}
		if(event.code == 'KeyO') // O - Открыть
		{
			gload.click();

			event.preventDefault();
			
			return false;
		}
		if(event.code == 'KeyS') // S - Сохранить
		{
			this.client_save_gml();

			event.preventDefault();

			return false;
		}
		if(event.code == 'KeyR') // R - Переименовать
		{
			this.rename_dialog();

			event.preventDefault();
			
			return false;
		}
		if(event.code == 'KeyQ') // Q - Закрыть
		{
			this.close_graph();

			event.preventDefault();
			
			return false;
		}

		if(event.code == 'KeyW') // W - Закрыть все
		{
			this.close_all();

			event.preventDefault();
			
			return false;
		}

		// Правка

		if(event.code == 'KeyZ') // Z - Отмена
		{
			this.editing_back();

			event.preventDefault();
			
			return false;
		}


		if(event.code == 'KeyY') // Y - Вернуть
		{
			this.editing_forward();

			event.preventDefault();
			
			return false;
		}

		if(event.code == 'Delete') // Del - Удалить
		{
			this.delete_selected_obj();

			event.preventDefault();
			
			return false;
		}

		if(event.code == 'KeyL') // L - Настройки
		{
			this.dialog_settings();

			event.preventDefault();
			
			return false;
		}

		// Вид

		if(event.code == 'KeyM') // M - Названия вершин
		{
			this.vertex_name_visible(document.getElementById('numer_button'));

			event.preventDefault();
			
			return false;
		}

		if(event.code == 'Equal') // + - Увеличить
		{
			this.scaling(this.scaleCoef, gcanv.width/2, gcanv.height/2);

			event.preventDefault();
			
			return false;
		}

		if(event.code == 'Minus') // - - Уменьшить
		{
			this.scaling(1/this.scaleCoef, gcanv.width/2, gcanv.height/2);

			event.preventDefault();
			
			return false;
		}

		if(event.code == 'Digit0') // 0 - В обычном рзмере
		{
			this.scaling(false);

			event.preventDefault();
			
			return false;
		}

		// Режим

		if(event.code == 'KeyV') // V - Режим вершин
		{
			this.set_mode(0);

			event.preventDefault();
			
			return false;
		}

		if(event.code == 'KeyE') // E - Режим ребер
		{
			this.set_mode(1);

			event.preventDefault();
			
			return false;
		}

		if(event.code == 'KeyD') // D - Режим удаления
		{
			this.set_mode(2);

			event.preventDefault();
			
			return false;
		}

		if(event.code == 'KeyC') // С - Режим выделения
		{
			this.set_mode(6);

			event.preventDefault();
			
			return false;
		}

		// Горячие клавиши не для меню

		if(event.code == 'ArrowRight') // Стрелка вправо - переключить граф на вкладку правее
		{
			let t = this.tabs.flat();
			
			let i = t.indexOf(this.tabs[this.currentGraphNum]);
			
			if(i == t.length - 1)
			{
				return;
			}
			
			this.select_graph(this.tabs.indexOf(t[i + 1]));
			
			this.tab_bar.changeTab(t[i + 1]);

			event.preventDefault();
			
			return false;
		}

		if(event.code == 'ArrowLeft') // Стрелка влево - переключить граф на вкладку левее
		{
			let t = this.tabs.flat();
			
			let i = t.indexOf(this.tabs[this.currentGraphNum]);
			
			if(i == 0)
			{
				return;
			}
			
			this.select_graph(this.tabs.indexOf(t[i - 1]));
			
			this.tab_bar.changeTab(t[i - 1]);
			
			return false;
		}
		
	}

	body_key_up(event) // Отпускание кнопки клавиатуры
	{
		this.keyLock = false;
		
		if(!event.ctrlKey && !event.metaKey) // Ctrl или Cmd
		{
			this.keys['ctrl'] = false;

			if(this.onZoom) // Меняем состояние лупы на +
			{
				this.tool_loupe_change(true);
			}
		}
	}

	body_click(event) // Клик на теле
	{
		this.canvas_mouse_move(event); // Обновить
	}

	// Utils

	set_mode(mode) // Смена режима
	{
		if(mode == -1)
		{
			if( (this.mode != -1)&&(this.mode != 3)&&(this.mode != 4) )
			{
				this.lastMode = this.mode;
			}
			
			this.mode = mode;
			
			return ;
		}

		if( (mode == 3)||(mode == 4) )
		{
			if(this.graph.edge_count == 0){ return ; }
		}

		if(this.mode == 6)
		{
			this.graph.vertex_clear();
		}

		this.mode = mode;
		
		if( (this.mode != 3)&&(this.mode != 4) )
		{
			this.lastMode = this.mode;
		}
		
		this.isOst = this.isSc = this.isDist = this.isWave = this.isAfb = this.isDeg = this.isEl = false;

		gcanv.style.cursor = 'default';
		
		this.unchecked_all_tools(); // Отключение инструментов

		if(this.mode >= 0 && this.mode <= 2 || this.mode == 6)
		{
			this.unchecked_all_modes();
		}

		if(this.mode == 0)
		{
			document.getElementById('message-box').innerHTML = 'Режим вершин. Ставьте и двигайте вершины.';
			
			this.menu.mode_vertex.setCheck(true);
		}	
		
		if(this.mode == 1)
		{
			document.getElementById('message-box').innerHTML = 'Режим ребер. Соединяйте вершины.';
			
			this.menu.mode_edge.setCheck(true);
		}
		
		if(this.mode == 2)
		{
			document.getElementById('message-box').innerHTML = 'Режим удаления. Удаляйте элементы.';
			
			this.menu.mode_delete.setCheck(true);
		}
		
		if((this.mode == 3)||(this.mode == 4))
		{
			document.getElementById('message-box').innerHTML = 'Выберете начальную и конечную вершины для поиска.';
		}
		
		if(this.mode == 6)
		{
			document.getElementById('message-box').innerHTML = 'Режим выделения. Выделяйте элементы мышью. Выбрать несколько элементов можно при зажатом Ctrl.';
			
			this.menu.mode_select.setCheck(true);
		}
		
		this.subMode = 0;
		
		this.draw();
	}

	collision(x, y) // Проверка возможнсти размещения вершины в координатах x, y
	{ 
		for(let i in this.graph.vertex)
		{
			if(i == this.currentVertex){ continue; }

			if(  Math.sqrt( Math.pow(x - this.graph.vertex[i].x, 2) + Math.pow(y - this.graph.vertex[i].y, 2) ) <= 1.5 * 2.5 * this.baseSize  )
			{
				return false;
			}
		}

		return true;
	}
  
	vertex_name_visible() // Смена отображения имен вершин
	{
		this.onNum = !this.onNum;
		window.localStorage.onNum = this.onNum;

		this.draw();
	}
 
	add_edge(ort) // Добавление ребра после ввода его характеристик
	{
		// ort - направленность ребра (0 - не ориентированно, 1 - ориентированно из вершины 1 в вершину 2)
		
		this.subMode = 0;
		this.graph.vertex[this.currentVertex].state = 0;
		gcanv.style.cursor = 'pointer';

		this.graph.edge_add(this.currentVertex, this.currentVertex2, ort, parseInt(iweight.value), 0);

		if(this.edgeContextKey)
		{
			this.mode = this.lastMode;
			this.edgeContextKey = false;
		}
	}
 
	client_save_gml() // Сохранение графа на клиенте в формате GML
	{
		gsave.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.graph.get_gml());
		isave.value = this.graph.name;
		gsave.download = this.graph.name + '.gml';

		this.dialogs['save'].show();
	}

	file_rename(text) // Изменение имени скачиваемого файла (графа)
	{
		gsave.download = text + '.gml';

		this.change_title(text);
		this.change_name(text);
	}

	image_open() // Открыть изображение в новой вкладке
	{
		let newTab = window.open();
		newTab.document.body.innerHTML = '<img src=\''+ gcanv.toDataURL() +'\'>';
	}

	image_rename(text) // Изменение имени скачиваемого изображения
	{
		document.getElementById('image-save').download = text + '.png';
	}

	graph_alg_test() // Проверка на доступность графа для алгоритмов
	{
		let alg = {}; 

		if(this.graph.vertex_count == 0) // Графа нет 
		{
			this.menu.alg_sc.setEnabled(false); // Компоненты сильной связности
			this.menu.alg_dist.setEnabled(false); // Расстояния в ориентированном графе
			this.menu.alg_route.setEnabled(false); // Поиск пути
			this.menu.alg_el_cycle.setEnabled(false); // Эйлеров цикл
			this.menu.alg_el_chain.setEnabled(false); // Эйлерова цепь
			this.menu.alg_ost.setEnabled(false); // Минимальное остовное дерево
			this.menu.alg_deg.setEnabled(false); // Степени вершин

			alg.sc = alg.dist = alg.route = alg.el_cycle = alg.el_chain = alg.mts = alg.deg = false;
			
			return alg;
		}
		else
		{
			this.menu.alg_sc.setEnabled(true); // Компоненты сильной связности
			this.menu.alg_dist.setEnabled(true); // Расстояния в ориентированном графе
			this.menu.alg_route.setEnabled(true); // Поиск пути
			this.menu.alg_el_cycle.setEnabled(true); // Эйлеров цикл
			this.menu.alg_el_chain.setEnabled(true); // Эйлерова цепь
			this.menu.alg_ost.setEnabled(true); // Минимальное остовное дерево
			this.menu.alg_deg.setEnabled(true); // Степени вершин

			alg.sc = alg.dist = alg.route = alg.el_cycle = alg.el_chain = alg.mts = alg.deg = true;
		}

		if(this.graph.edge_count == 0) // Ребер нет
		{
			this.menu.alg_el_cycle.setEnabled(false); // Эйлеров цикл
			this.menu.alg_el_chain.setEnabled(false); // Эйлерова цепь
			this.menu.alg_dist.setEnabled(false); // Расстояния в ориентированном графе
			this.menu.alg_ost.setEnabled(false); // Минимальное остовное дерево

			alg.dist = alg.el_cycle = alg.el_chain = alg.mts = false;
		}
		else
		{
			for(let i in this.graph.edge)
			{
				if(this.graph.edge[i].arrow == 1)
				{
					this.menu.alg_ost.setEnabled(false); // Минимальное остовное дерево
					this.menu.alg_el_cycle.setEnabled(false); // Эйлеров цикл
					this.menu.alg_el_chain.setEnabled(false); // Эйлерова цепь

					alg.el_cycle = alg.el_chain = alg.mts = false;
					
					break;
				}
			}

			for(let i in this.graph.edge)
			{
				if(this.graph.edge[i].arrow == 0)
				{
					this.menu.alg_dist.setEnabled(false); // Расстояния в ориентированном графе

					alg.dist = false;
					
					break;
				}
			}	
		}

		return alg;		
	}

	graph_alg_route_test() // Выбор алгоритма для поиска минимального пути
	{
		let weight = false; // Нагруженность графа

		for(let i in this.graph.edge)
		{	
			if(this.graph.edge[i].weight != 0)
			{
				weight = true;
				
				break;
			}
		}

		if(weight)
		{
			this.set_mode(4);
		}
		else
		{
			this.set_mode(3);
		}
	}
 
	alg_is_active() // Активность какого-либо алгоритма
	{ 
		return (this.isOst||this.isSc||this.isDist||this.isWave||this.isAfb||this.isDeg||this.isEl);
	}
 
	import_gml(text) // Генерация графа из GML
	{
		this.graph.load_gml(text);

		if(gload.files.length > 0)
		{
			this.change_name(gload.files[0].name.split('.')[0]);
			this.change_title(gload.files[0].name.split('.')[0]);
		}

		this.camera_to_center();

		this.draw();

		this.graph.history.clear();
		this.graph.history.write(this.graph);
	}

	change_title(text) // Изменение заголовка и т.д
	{
		document.getElementsByTagName('title')[0].innerHTML = text + ' - редактор графов';
		document.getElementById('head-text').innerHTML = text + ' - редактор графов';

		isave.value = text;
	}

	add_edge_start() // Добавление ребра через контекстное меню
	{
		this.lastMode = this.mode;
		this.mode = 1; 
		this.graph.vertex[this.contextVertex].state = 1;
		this.currentVertex = this.contextVertex; // Номер выбраной вершины
		gcanv.style.cursor = 'crosshair';
		this.subMode = 1;
		this.edgeContextKey = true;
	}

	point_into_triangle(x1, y1, x2, y2, x3, y3, x4, y4) // Находится ли точка x4, y4 внутри треугольника
	{
		// (x1, y1), (x2, y2), (x3, y3) - треугольник, (x4, y4) - точка
		
		let y = (x3 - x1) / (y3 - y1);
		let x = ((x4 - x1) - y * (y4 - y1)) / ((x2 - x1)-y * (y2 - y1));
		
		y = ( (y4 - y1) - x * (y2 - y1) ) / (y3 - y1);

		return (x >= 0 && y >= 0 && x + y <= 1);
	}

	cursor_over_edge(j, event) // Находится ли курсор над ребром j
	{
		function over_one(xv, yv, xw, yw, weight, arrow)
		{
			let px1 = xw - xv; // вектор х
			let py1 = yw - yv; // вектор y

			let len = Math.sqrt( Math.pow(px1, 2) + Math.pow(py1, 2) ); // Длина ребра

			py1 /= len;
			px1 /= len;

			let px2;
			let py2;
			if( (py1!=0)||(px1!=0) )
			{
				px2 = py1;
				py2 = -px1;
			}

			let a = {x:0, y:0}; // Координаты линии ребра
			let b = {x:0, y:0}; // Координаты линии ребра
			let c = {x:0, y:0}; // Координаты линии ребра
			let d = {x:0, y:0}; // Координаты линии ребра
			let dot = this.undef(event.offsetX, event.offsetY);
			let p = {x:dot.x, y:dot.y}; // Точка клика

			let k = 0.5;

			a.x = xv + px2*this.baseSize*k;
			a.y = yv + py2*this.baseSize*k;

			b.x = xw + px2*this.baseSize*k;
			b.y = yw + py2*this.baseSize*k;

			c.x = xw - px2*this.baseSize*k;
			c.y = yw - py2*this.baseSize*k;

			d.x = xv - px2*this.baseSize*k;
			d.y = yv - py2*this.baseSize*k;

			let bx = xw -  px1*(1.5*this.baseSize+4);
			let by = yw - py1*(1.5*this.baseSize+4);

			let m = {x:0, y:0}; // Координаты стрелочки ребра
			let n = {x:0, y:0}; // Координаты стрелочки ребра
			let l = {x:0, y:0}; // Координаты стрелочки ребра

			if((weight == 0)&&(arrow == 0)) // Если ребро не направлено и вес = 0
			{
				if( this.point_into_triangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y)||this.point_into_triangle(c.x, c.y, d.x, d.y, a.x, a.y, p.x, p.y) )
				{
					return true;
				}
				else{ return false; }
			}

			k = 1;

			m.x = bx;
			m.y = by;

			n.x = xw - px1*3.5*this.baseSize - px2*k*this.baseSize;
			n.y = yw - py1*3.5*this.baseSize - py2*k*this.baseSize;

			l.x = xw - px1*3.5*this.baseSize + px2*k*this.baseSize;
			l.y = yw - py1*3.5*this.baseSize + py2*k*this.baseSize;			

			if( this.point_into_triangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y)||this.point_into_triangle(c.x, c.y, d.x, d.y, a.x, a.y, p.x, p.y)||(this.point_into_triangle(m.x, m.y, n.x, n.y, l.x, l.y, p.x, p.y)&&(arrow==1)) )
			{
				return true;
			}
			else
			{
				return false;
			}
		}

		if(this.graph.edge[j].v == this.graph.edge[j].w) // Проверка на петлю
		{
			let ver = {x:this.graph.vertex[this.graph.edge[j].v].x -2*this.baseSize, y:this.graph.vertex[this.graph.edge[j].v].y}; // Вершина
			let dot = this.undef(event.offsetX, event.offsetY);
			let p = {x:dot.x, y:dot.y}; // Точка клика
			let rad = 2*this.baseSize;

			if(( Math.pow(p.x-ver.x, 2) + Math.pow(p.y-ver.y, 2) <= Math.pow(rad+this.baseSize/2,2) )&&( Math.pow(p.x-ver.x, 2) + Math.pow(p.y-ver.y, 2) >= Math.pow(rad-this.baseSize/2,2) ))
			{
				return true;
			}
			else
			{
				return false;
			}
		}

		for(let i in this.graph.edge) // Проверка на двойные ребра
		{			
			if((this.graph.edge[j].v == this.graph.edge[i].w)&&(this.graph.edge[j].w == this.graph.edge[i].v))
			{
				let px1 = this.graph.vertex[this.graph.edge[j].w].x - this.graph.vertex[this.graph.edge[j].v].x; // вектор х
				let py1 = this.graph.vertex[this.graph.edge[j].w].y - this.graph.vertex[this.graph.edge[j].v].y; // вектор y

				let len = Math.sqrt( Math.pow(px1, 2) + Math.pow(py1, 2) ); // Длина ребра

				py1 /= len;
				px1 /= len;

				let px2;
				let py2;
				if( (py1 != 0)||(px1 != 0) )
				{
					px2 = py1;
					py2 = -px1;
				}	

				let k = 0.9;

				let xv = this.graph.vertex[this.graph.edge[j].v].x - px2*k*this.baseSize;
				let yv = this.graph.vertex[this.graph.edge[j].v].y - py2*k*this.baseSize;
				let xw = this.graph.vertex[this.graph.edge[j].w].x - px2*k*this.baseSize;
				let yw = this.graph.vertex[this.graph.edge[j].w].y - py2*k*this.baseSize;

				return over_one.call(this, xv, yv, xw , yw, this.graph.edge[j].weight, this.graph.edge[j].arrow);
			}
		}

		// Для обычных ребер
		return over_one.call(this, this.graph.vertex[this.graph.edge[j].v].x, this.graph.vertex[this.graph.edge[j].v].y, this.graph.vertex[this.graph.edge[j].w].x, this.graph.vertex[this.graph.edge[j].w].y, this.graph.edge[j].weight, this.graph.edge[j].arrow);

	}

	cursor_over_vertex(i, event) // Находится ли курсор над вершиной i
	{
		let p = {x:event.offsetX, y:event.offsetY}; // Курсор

		let vertex = this.def(this.graph.vertex[i].x, this.graph.vertex[i].y);

		return ( Math.pow(p.x-vertex.x, 2) + Math.pow(p.y-vertex.y, 2) <= Math.pow( 1.5*this.baseSize*this.scale, 2 ) );
	}

	set_settings(key) // Сохранение настроек (установить настройки)
	{
		if(key === false) // Скинуть настройки по-умолчанию
		{
			this.onLiters = false;
			window.localStorage.clear();
			this.palette = new Colors();

			this.draw();
			return ;
		}

		let vertex_name = document.getElementsByName('vertex_name');

		for(let i=0;i<vertex_name.length;i++)
		{
			if(vertex_name[i].checked)
			{
				if((vertex_name[i].value == 'number')&&(this.onLiters)){ this.onLiters = false; }

				if((vertex_name[i].value == 'letter')&&(!this.onLiters)){ this.onLiters = true; }
			}
		}

		window.localStorage.onLiters = this.onLiters;

		this.palette.background = background_fill.value;

		this.palette.vertex.state0 = vertex_fill.value;

		this.palette.vertex.state2 = vertex_fill_s2.value;

		this.palette.vertex.state1 = vertex_fill_s1.value;

		this.palette.edge.state0 = edge_fill.value;

		this.palette.edge.state2 = edge_fill_s2.value;

		this.palette.stroke = color_stroke_fill.value;

		this.palette.text = color_text_fill.value;

		this.palette.text_deg = color_text_deg_fill.value;

		this.palette.reset(); // Записать текущие настройки в хранилище (перезапись хранилища)

		this.draw();
	}

	install_palette_dialog(palette) // Установить цвета в диалоге настроек
	{
		background_fill.value = palette.background;

		vertex_fill.value = palette.vertex.state0;
		vertex_fill_s2.value = palette.vertex.state2;
		vertex_fill_s1.value = palette.vertex.state1;

		edge_fill.value = palette.edge.state0;
		edge_fill_s2.value = palette.edge.state2;

		color_stroke_fill.value = palette.stroke;
		color_text_fill.value = palette.text;
		color_text_deg_fill.value = palette.text_deg;
	}

	dialog_palette_classic() // Установить классическую палитру
	{
		let classic_palette = new Colors();
		classic_palette.set_theme('classic');
		
		this.install_palette_dialog(classic_palette);
	}

	dialog_palette_standart() // Установить стандартную палитру
	{
		let standart_palette = new Colors();
		standart_palette.set_theme('standart');
		
		this.install_palette_dialog(standart_palette);
	}

	tool_loupe() // Инструмент лупа
	{
		if(!this.onZoom)
		{			
			this.unchecked_all_tools(); 

			document.getElementById('message-box').innerHTML = 'Инструмент лупа. Кликайте мышью для использования. При зажатом Ctrl лупа отдаляет.';
			
			this.menu.tool_loupe.setCheck(true);

			this.tool_loupe_change(true);
		}
		else
		{
			this.unchecked_all_tools(); 

			this.onZoom = false
			gcanv.style.cursor = 'default';
			this.set_mode(this.mode);
			
			this.menu.tool_loupe.setCheck(false);
		}
	}

	tool_move_place() // Инструмент перемещение рабочей области
	{	
		if(!this.onMovePlace)
		{
			this.unchecked_all_tools(); 

			document.getElementById('message-box').innerHTML = 'Инструмент перемещение рабочей области. Зажмите ЛКМ и двигайте рабочую область.';
			
			this.menu.tool_move_place.setCheck(true);

			gcanv.style.cursor = 'pointer';

			this.onMovePlace = true;
		}
		else
		{
			this.unchecked_all_tools(); 

			this.onMovePlace = false;
			gcanv.style.cursor = 'default';
			this.set_mode(this.mode);
			
			this.menu.tool_move_place.setCheck(false);
		}
	}

	tool_move_graph() // Инструмент перемещение графа
	{	
		if(!this.onMoveGraph)
		{
			this.unchecked_all_tools(); 

			document.getElementById('message-box').innerHTML = 'Инструмент перемещение графа. Зажмите ЛКМ и двигайте граф целиком.';
			
			this.menu.tool_move_graph.setCheck(true);
			
			gcanv.style.cursor = 'pointer';

			this.onMoveGraph = true;
		}
		else
		{
			this.unchecked_all_tools();

			this.onMoveGraph = false;
			gcanv.style.cursor = 'default';
			this.set_mode(this.mode);
			
			this.menu.tool_move_graph.setCheck(false);
		}
	}
	
	unchecked_all_modes() // Снять выделение со всех режимов
	{
		this.menu.mode_vertex.setCheck(false);
		this.menu.mode_edge.setCheck(false);
		this.menu.mode_delete.setCheck(false);
		this.menu.mode_select.setCheck(false);
	}
	
	unchecked_all_tools() // Снять выделение со всех инструментов
	{
		this.menu.tool_loupe.setCheck(false);
		this.menu.tool_move_place.setCheck(false);
		this.menu.tool_move_graph.setCheck(false);
		
		this.onZoom = false;
		this.onMovePlace = false;
		this.onMoveGraph = false;
	}

	tool_loupe_change(dir) // Смена направления лупы
	{
		// dir - направление лупы ( true - увеличение, false - уменьшение )
		
		let k = 1.5; // Коэффициент увеличения / уменьшения (шаг) CONST

		if(dir)
		{
			this.onZoom =  k;
			gcanv.style.cursor = 'zoom-in';		
		}
		else
		{
			this.onZoom =  1/k;
			gcanv.style.cursor = 'zoom-out';	
		}
	}

	camera_to_center() // Разместить камеру по центру графа
	{
		if(this.graph.vertex_count == 0){ return ; } 

		let min = {left:Infinity, top:Infinity, right:0, bottom:0}; // Крайние координаты вершин

		for(let i in this.graph.vertex)
		{
			let x = this.graph.vertex[i].x;
			let y = this.graph.vertex[i].y;

			if(x < min.left){ min.left = x; }
			if(x > min.right){ min.right = x; }
			if(y < min.top){ min.top = y; }
			if(y > min.bottom){ min.bottom = y; }
		}

		let c = {x:(min.right+min.left)/2, y:(min.bottom+min.top)/2}; // Центр графа

		this.view.x = gcanv.width/2-c.x;
		this.view.y = gcanv.height/2-c.y;

		this.draw();
	}

	add_vertex(x, y) // Добавить вершину в координатах x y
	{
		let dot = this.undef(x, y);

		if(this.onLiters)
		{
			this.graph.vertex_add(dot.x, dot.y, 2, 0, String.fromCharCode(this.graphCharList[this.currentGraphNum]++));
		}
		else
		{
			this.graph.vertex_add(dot.x, dot.y, 2, 0);
		}

		this.vertexMode = 1;
		gcanv.style.cursor = 'pointer';
	}

	editing_back() // Правка - отменить
	{
		this.graph.history_back();
		
		this.draw();
	}

	editing_forward() // Правка - вернуть
	{
		this.graph.history_next();
		
		this.draw();
	}

	graph_editing_test() // Проверка на доступность графа для отмены и вернуть
	{
		if(this.graph.history.pos == 0)
		{
			this.menu.edit_back.setEnabled(false);
		}
		else
		{
			this.menu.edit_back.setEnabled(true);
		}
		
		if(this.graph.history.pos == this.graph.history.list.length-1)
		{
			this.menu.edit_forward.setEnabled(false);
		}
		else
		{
			this.menu.edit_forward.setEnabled(true);
		}
		
		if(this.selectedObj.vertex.length == 0 && this.selectedObj.edge.length == 0)
		{
			this.menu.edit_delete.setEnabled(false);
		}
		else
		{
			this.menu.edit_delete.setEnabled(true);
		}
	}

	delete_selected_obj() // Удалить выделенные объекты
	{
		for(let i in this.selectedObj.edge)
		{
			this.graph.edge_remove(this.selectedObj.edge[i], false);
		}
		
		for(let i in this.selectedObj.vertex)
		{
			this.graph.vertex_remove(this.selectedObj.vertex[i], false);
		}

		this.graph.history.write(this.graph);

		this.selectedObj.vertex = [];
		this.selectedObj.edge = [];

		this.draw();
	}

	scaling(koef, x, y) // Масштабирование
	{ 
		if(koef === false) // Масштаб по-умолчанию
		{
			let p = { x:gcanv.width/2, y:gcanv.height/2 };
			this.camera_shift( (p.x-p.x/this.scale), (p.y-p.y/this.scale) );
			this.scale = 1;
			this.camera_to_center();
			this.draw();
			
			return ;
		}

		if((this.scale * koef > 20)|(this.scale * koef < 1 / 20)) // Ограничение масштабирования
		{
			return ;
		}

		let p = {}; // Клик в абсолютных координатах

		if((x !== undefined)&&(y !== undefined)){ p = {x: x, y: y}; } // Масштабировать от заданной точки
		else{ p={ x:gcanv.width/2, y:gcanv.height/2 }; } // Масштабировать от центра

		this.scale *= koef;

		this.camera_shift( (p.x-p.x*koef)/this.scale, (p.y-p.y*koef)/this.scale );

		this.draw();
	}

	camera_shift(x, y) // Перемещение вида (камеры)
	{
		this.view.x += x;
		this.view.y += y;
	}

	def(x, y) // Перевод координат
	{
		let vertex = {};
		vertex.x = (x + this.view.x) * this.scale;
		vertex.y = (y + this.view.y) * this.scale;

		return vertex;
	}

	undef(x, y) // Перевод координат
	{
		let vertex = {};
		vertex.x = (x / this.scale - this.view.x);
		vertex.y = (y / this.scale - this.view.y);

		return vertex;
	}

	new_graph() // Новый граф
	{
		this.graphList.push(new Graph()); // Добавляем пустой граф

		this.tab_add(this.graphList.length-1); // Добавляем вкладку
		
		this.select_graph(this.graphList.length-1); // Устанавливаем текущим графом

		this.graphCharList[this.currentGraphNum] = 65; // Устанавливаем начальный символ для именования вершин
	}

	select_graph(n) // Переключение графа
	{
		this.graph = this.graphList[n];

		this.currentGraphNum = n;
		
		this.draw();

		this.change_title(this.graph.name);

		this.tab_bar.changeTab(this.tabs[n]);
	}

	close_graph() // Закрыть граф
	{
		let tmp_graph = this.currentGraphNum;

		let find = false;
		
		for(let i=this.currentGraphNum-1;i>=0;i--)
		{
			if(this.graphList[i] != undefined)
			{
				this.select_graph(i);
				find = true;
				
				break;
			}
		}

		if(!find)
		{
			for(let i=this.currentGraphNum+1;i<this.graphList.length;i++)
			{
				if(this.graphList[i] != undefined)
				{
					this.select_graph(i);
					find = true;
					
					break;
				}
			}
		}
		
		delete(this.graphList[tmp_graph]);

		if(!find)
		{
			this.new_graph();
		}

		this.tab_delete(tmp_graph);
	}

	change_name(text) // Смена имени графа
	{
		this.graph.name = text;

		this.tabs[this.currentGraphNum].setText(text);
	}

	graph_rename(text) // Переименовать граф
	{
		this.change_name(text);
		this.change_title(text);
	}

	close_all() // Закрыть все
	{
		this.tab_bar.remove();
		this.tab_bar = Tlaloc.tabs('tabs');
		
		this.graphList = [];

		this.new_graph();
	}
	
	// Dialogs
	
	dialog_show(name)
	{
		this.dialogs[name].show();
		
		this.onDialog = true;
	}
	
	dialog_hide(name)
	{
		this.dialogs[name].hide();
		
		this.onDialog = false;
	}
	
	rename_dialog() // Диалог преименования графа
	{
		document.querySelector('#graph-name').value = this.graph.name;

		this.dialog_show('rename');
	}
	
	dialog_settings() // Отобразить диалог настроек
	{
		let vertex_name = document.getElementsByName('vertex_name');

		for(let i=0;i<vertex_name.length;i++)
		{
			if((vertex_name[i].value == 'number')&&(!this.onLiters)){ vertex_name[i].checked = true; }

			if((vertex_name[i].value == 'letter')&&(this.onLiters)){ vertex_name[i].checked = true; }
		}

		this.install_palette_dialog(this.palette);

		this.dialog_show('settings');
	}
	
	dialog_edge_edit() // Отобразить диалог изменения ребра
	{
		document.getElementById('edit-weight').value = this.graph.edge[this.contextEdge].weight;

		this.dialog_show('edge_edit');
	}
	
	dialog_matrix_adjacency() // Отобразить диалог матрицы смежности
	{
		document.getElementById('matrix').innerHTML = this.graph.get_matrix_adjacency();

		this.dialogs['matrix'].setTitle('Матрица смежности');
		this.dialog_show('matrix');
	}

	dialog_matrix_incidence() // Отобразить диалог матрицы инцидентности
	{
		document.getElementById('matrix').innerHTML = this.graph.get_matrix_incidence();
		
		this.dialogs['matrix'].setTitle('Матрица инцидентности');
		this.dialog_show('matrix');
	}
 
	vertex_rename_dialog() // Диалог переименования вершины
	{
		if(this.graph.vertex[this.contextVertex].name != undefined)
		{
			document.getElementById('vertex-rename-text').value = this.graph.vertex[this.contextVertex].name;
		}
		else
		{
			document.getElementById('vertex-rename-text').value = this.contextVertex;
		}

		this.dialog_show('vertex_rename');
	}
	
	dialog_save_image() // Отобразить диалог сохранения изображения графа
	{
		document.getElementById('image-save').href = gcanv.toDataURL();

		document.getElementById('save-img').src = gcanv.toDataURL();

		this.dialog_show('image_save');
	}

	// Draw

	draw() // Отрисовка
	{	
		if(this.isOst)
		{
			ost();
			
			return ;
		}
		if(this.isSc)
		{
			sc();
			
			return ;
		}
		if(this.isDist)
		{
			return ;
		}			
		if(this.isWave)
		{
			wave(this.currentVertex, this.currentVertex2);

			return ;
		}
		if(this.isAfb)
		{
			afb(this.currentVertex, this.currentVertex2);

			return ;
		}
		if(this.isDeg)
		{
			deg();
			return ;
		}			

		let canva = this.draw_init(); // Инициализация холста

		if(this.graph === undefined || this.graph.vertex_count == 0) // Отрисовка заставки
		{
			this.draw_splash();
			
			return ;
		}

		this.draw_edge(canva, this.graph.edge); // Отрисовка ребер

		this.draw_vertex(canva); // Отрисовка вершин
	}
	 
	draw_alt() // Альтернативная функция отрисовки для алгоритмов
	{
		let canva = this.draw_init(); // Инициализация холста

		this.draw_edge(canva, this.graph.new_edge); // Отрисовка ребер

		this.draw_vertex(canva, this.palette.vertex.state1); // Отрисовка вершин
	}

	draw_alt_2() // Альтернативная функция2 отрисовки для алгоритмов
	{
		let canva = this.draw_init(); // Инициализация холста

		this.draw_edge(canva,this.graph.edge); // Отрисовка ребер

		this.draw_vertex(canva); // Отрисовка вершин
	}

	draw_init() // Инициализация холста
	{
		let canva = gcanv.getContext("2d");

		gcanv.width = gcanv.width;

		canva.fillStyle = this.palette.background;
		canva.fillRect(0,0,gcanv.width,gcanv.height);

		return canva;
	}

	draw_vertex(canva, color) // Отрисовка вершин
	{
		for(let i in this.graph.vertex) // Отрисовка вершин
		{
			let vertex = this.def(this.graph.vertex[i].x, this.graph.vertex[i].y);

			canva.beginPath();
			canva.arc(vertex.x, vertex.y, 1.5 * this.baseSize * this.scale, 0, Math.PI * 2, false);
			
			if(color === undefined)
			{
				if(this.graph.vertex[i].state == 0)
				{
					canva.fillStyle = this.palette.vertex.state0;
				}
				if(this.graph.vertex[i].state == 1)
				{
					canva.fillStyle = this.palette.vertex.state1;
				}
				if(this.graph.vertex[i].state == 2)
				{
					canva.fillStyle = this.palette.vertex.state2;
				}
				if(this.graph.vertex[i].state == 5)
				{
					canva.fillStyle = this.palette.vertex.state1;
				}
				if(this.graph.vertex[i].select == 1)
				{
					canva.fillStyle = this.palette.vertex.state1;
				}
			}
			else
			{
				canva.fillStyle = color;
			}
			
			canva.fill();
			canva.lineWidth = 2 * this.scale;
			canva.strokeStyle = this.palette.stroke;
			canva.stroke();
			canva.closePath();

			if(this.onNum)
			{
				canva.fillStyle = this.palette.text;
				canva.textBaseline = 'middle';
				canva.textAlign = 'center';

				if(this.graph.vertex[i].name !== undefined)
				{
					canva.font = 'bold ' + 2 * this.baseSize * this.scale + 'px Arial';
					canva.fillText(this.graph.vertex[i].name, vertex.x, vertex.y);
				}
				else
				{
					if(i <= 99)
					{
						canva.font = 'bold ' + 2 * this.baseSize * this.scale + 'px Arial';
					}
					else{ canva.font = 'bold ' + this.baseSize * this.scale + 'px Arial'; }

					canva.fillText(i, vertex.x, vertex.y);
				}
			}	
		}
	}

	draw_edge(canva, edge) // Отрисовка ребер
	{
		function draw_weight(weight, x, y) // Отрисовка веса ребра
		{
			let dr = 0.9; // CONST

			canva.fillStyle = this.palette.stroke; // Рамка
			canva.fillRect(x - this.baseSize*this.scale*dr -2*this.scale, y - this.baseSize*this.scale*dr -2*this.scale, this.baseSize*this.scale*2*dr +4*this.scale, this.baseSize*this.scale*2*dr +4*this.scale);

			canva.fillStyle = this.palette.vertex.state0; // Ячейка
			canva.fillRect(x - this.baseSize*this.scale*dr, y - this.baseSize*this.scale*dr, this.baseSize*this.scale*2*dr, this.baseSize*this.scale*2*dr );

			canva.fillStyle = this.palette.text; // Текст
			canva.textBaseline = 'middle';
			canva.textAlign = 'center';
			canva.font = 'bold ' + 2 * this.baseSize * this.scale * dr * 0.9 + 'px Arial';
			canva.fillText(weight, x, y);
		} 

		function draw_arrow(xw, yw, xv, yv, color) // Отрисовка стрелочки
		{
			let p = {x:xw - xv, y:yw - yv}; // Вектор ребра v -> w

			let len = Math.sqrt( Math.pow(p.x, 2) + Math.pow(p.y, 2) ); // Длина ребра(вектора)

			p.x /= len; // Единичный вектор ребра v -> w
			p.y /= len; //

			let p2;
			if( (p.y != 0)||(p.x != 0) )
			{
				p2 = {x:p.y, y:-1*p.x}; // Единичный вектор, перпендикуляр ребра v -> w
			}	

			let b = {x:xw - p.x*this.scale*(1.9*this.baseSize), y:yw - p.y*this.scale*(1.9*this.baseSize)}; // Вершина стрелочки

			let k = 0.6; // CONST Угол стрелочки

			// Отрисовка стрелочки
			canva.beginPath();
			canva.moveTo(b.x, b.y);
			canva.lineTo(xw - p.x*3.5*this.baseSize*this.scale - p2.x*k*this.baseSize*this.scale, yw - p.y*3.5*this.baseSize*this.scale - p2.y*k*this.baseSize*this.scale);
			canva.lineTo(xw - p.x*3.5*this.baseSize*this.scale + p2.x*k*this.baseSize*this.scale, yw - p.y*3.5*this.baseSize*this.scale + p2.y*k*this.baseSize*this.scale);
			canva.lineTo(b.x, b.y);
			canva.closePath();

			canva.strokeStyle = canva.fillStyle = color;

			canva.stroke();
			canva.fill();
		}

		function draw_one(xv, yv, xw, yw, weight, arrow, color) // Отрисовка ребра
		{
			canva.strokeStyle = color;

			let px1 = xw - xv; // вектор х
			let py1 = yw - yv; // вектор y

			let len = Math.sqrt( Math.pow(px1, 2) + Math.pow(py1, 2) ); // Длина ребра

			py1 /= len;
			px1 /= len;

			if( (py1!=0)||(px1!=0) )
			{
				let px2 = py1;
				let py2 = -px1;
			}

			let bx;
			let by;
			
			if(arrow==1)
			{
				bx = xw - px1*this.scale*(3.5*this.baseSize);
				by = yw - py1*this.scale*(3.5*this.baseSize);
			}
			else
			{
				bx = xw;
				by = yw;
			}

			// [--Отрисовка линии ребра
			canva.beginPath();
			canva.moveTo(xv, yv);
			canva.lineTo(bx , by);
			canva.lineWidth = this.baseSize/2*this.scale;
			canva.stroke();
			canva.closePath();
			// Отрисовка линии ребра--]

			if(weight != 0) // Отрисовка веса ребра
			{
				draw_weight.call(this, weight, xv+(xw-xv)/2, yv+(yw-yv)/2);
			}

			if(arrow == 1) // Отрисовка стрелочки
			{			
				draw_arrow.call(this, xw, yw, xv, yv, color);
			}
		}

		for(let i in edge) // Отрисовка ребер
		{
			let color;
			
			if(edge[i].state == 2 || edge[i].select == 1)
			{
				color = this.palette.edge.state2;
			}
			else
			{
				color = this.palette.edge.state0;
			}

			let v = this.def(this.graph.vertex[edge[i].v].x, this.graph.vertex[edge[i].v].y);
			let w = this.def(this.graph.vertex[edge[i].w].x, this.graph.vertex[edge[i].w].y);

			if(edge[i].v == edge[i].w) // Проверка на петлю
			{
				canva.beginPath();
				canva.arc(v.x -2*this.baseSize*this.scale, v.y, 2*this.baseSize*this.scale, 0, Math.PI * 2, false);
				canva.lineWidth = this.baseSize/2*this.scale;
				canva.strokeStyle = color;
				canva.stroke();
				canva.closePath();

				if(edge[i].weight != 0) // Отрисовка веса ребра
				{
					draw_weight.call(this, edge[i].weight, v.x -4 * this.baseSize * this.scale, v.y);
				}

				continue;
			}

			let find = false;
			
			for(let j in edge) // Проверка на двойные ребра
			{			
				if((edge[j].v == edge[i].w)&&(edge[j].w == edge[i].v))
				{
					let px1 = w.x - v.x; // вектор х
					let py1 = w.y - v.y; // вектор y

					let len = Math.sqrt( Math.pow(px1, 2) + Math.pow(py1, 2) ); // Длина ребра

					py1 /= len;
					px1 /= len;

					let px2;
					let py2;
					
					if( (py1!=0)||(px1!=0) )
					{
						px2 = py1;
						py2 = -px1;
					}	

					let k = 0.9; // CONST

					let xv = v.x - px2*k*this.baseSize*this.scale;
					let yv = v.y - py2*k*this.baseSize*this.scale;
					let xw = w.x - px2*k*this.baseSize*this.scale;
					let yw = w.y - py2*k*this.baseSize*this.scale;

					draw_one.call(this, xv, yv, xw , yw,
					0, edge[i].arrow, color); // Отрисовать ребро без веса

					if(edge[i].weight != 0) // Отрисовать смещенный вес
					{
						draw_weight.call(this,edge[i].weight, xv + (xw-xv)/2 - px1*2*this.baseSize*this.scale, yv + (yw-yv)/2 - py1*2*this.baseSize*this.scale);
					}

					find = true;
					
					break;
				}
			}
			
			if(find)
			{
				continue;

			}
			
			draw_one.call(this,v.x, v.y, w.x, w.y, edge[i].weight, edge[i].arrow, color); // Отрисовать одинарное ребро
		}
	}

	draw_frame(x0, y0, xn, yn) // Отрисовка рамки
	{
		let canva = gcanv.getContext('2d');

		canva.fillStyle = this.palette.select; // Выделение
		canva.fillRect(x0, y0, xn-x0, yn-y0);

		canva.strokeStyle = this.palette.select_frame; // Рамка
		canva.lineWidth = 0.5; // CONST
		canva.strokeRect(x0, y0, xn-x0, yn-y0);
	}

	draw_splash() // Отрисовка заставки
	{
		let font_size = 25; // Размер шрифта заставки в пикселах CONST
		
		let canva = gcanv.getContext('2d');

		canva.fillStyle = this.palette.text; // Текст
		canva.textBaseline = 'middle';
		canva.textAlign = 'center';
		canva.font = 'bold ' + font_size + 'px Arial';
		//canva.fillText('GraphEditor '+this.version, gcanv.width/2, gcanv.height/2);
		canva.fillText('GraphEditor', gcanv.width/2, gcanv.height/2);
		canva.fillText('Кликните, чтобы начать', gcanv.width/2, gcanv.height/2+font_size*2);
	}

	// Menu

	tab_add(n) // Добавить вкладку
	{
		let obj = this;
		
		this.tabs[n] = this.tab_bar.addTab('Новый граф', function()
		{
			obj.select_graph(n);
			obj.tab_bar.changeTab(obj.tabs[n]);
		});
	}

	tab_delete(n) // Удалить вкладку
	{
		this.tab_bar.removeTab(this.tabs[n]);
		
		delete(this.tabs[n]);
	}
}
