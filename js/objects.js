            var enemyList = {};
            var upgradeList = {};
            var bulletList = {};
            var wallList = {};
            var aoe_upgrade_distance = 400;
            var heal_amount = 5;
            var player_atk_spd = 20;
            var iframe = 0;
            var frame_count = 0;
            var player;
            var enemy_atk_spd = 50;
            var paused = false;

            function object(new_tpye,new_x,new_y,new_spdx,new_spdy,new_width,new_height,new_color,new_id){
                var self ={
                    type:new_tpye,
                    x:new_x, 
                    y:new_y,
                    spdx:new_spdx,
                    spdy:new_spdy,
                    height:new_height,
                    width:new_width,
                    color:new_color,
                    id:new_id,
                    drawObject: function(){
                        board.save();
                        board.fillStyle = self.color;
                        board.fillRect(self.x-self.width/2,self.y-self.height/2,self.width,self.height);
                        board.restore();
                    },
                    move:function(){
                        self.x+=self.spdx;
                        self.y+=self.spdy;
                    },
                    update:function(){
                        self.drawObject();
                        self.move();
                    },
                }

                return self;
            }

            function wall(new_x,new_y,new_spdx,new_spdy,new_width,new_height,new_color,new_id){
                var self = object("wall",new_x,new_y,new_spdx,new_spdy,new_width,new_height,new_color,new_id);
               
                var super_update = self.update;
                self.update = function(){
                    super_update();
                    for(var lock in bulletList){
                        if(Collision(bulletList[lock],self))
                        {
                            delete bulletList[lock];
                            break;
                        }
                    }
                    for(var lock in enemyList){
                        if(Collision(enemyList[lock],self))
                        {
                            enemyList[lock].spdx = -enemyList[lock].spdx;
                            enemyList[lock].spdy = -enemyList[lock].spdy;
                            break;
                        }
                    }
                    
                       
                    

                }

                
                wallList[new_id] = self;
            }

            function rand_wall(){
                var unit_height = 15 + Math.random() * 30;
                var unit_width = 15 + Math.random() * 2;
                wall(Math.random()*(width - unit_width/2),Math.random()*(height - unit_height/2),0,0,unit_width,unit_height,"black",Math.random())
            }

            function Atk_object(new_tpye,new_x,new_y,new_spdx,new_spdy,new_width,new_height,new_color,new_id){
                var self = object(new_tpye,new_x,new_y,new_spdx,new_spdy,new_width,new_height,new_color,new_id);
                self.atk_color = new_color;
                self.atk_spd = player_atk_spd;
                self.atk_counter = 0;
                self.hp = 10;
                self.attack_action = function(){
                    if(self.atk_counter >= self.atk_spd )
                        {
                        rand_bullet(self.atk_angle,self);
                        self.atk_counter = 0;
                        }
                };
                return self;
            }

            function CreatePlayer(){
                var self = Atk_object("player",60,70,30,16,20,20,"green",1);
                self.iframe_seconds = 1.5;
                self.effect="";

                self.down_button = false;
                self.left_button = false;
                self.up_button = false;
                self.right_button = false;
        
                self.move = function(){
                    

                    if(self.up_button )
                        self.y  -= 7;
                    if(self.down_button)
                        self.y  +=7;
                    if(self.left_button)
                        self.x -= 7;
                    if(self.right_button)
                        self.x += 7;   

                    if(self.x < self.width/2) {
                        self.x = self.width/2;
                    }
                    if(self.x > width - self.width/2){
                        self.x = width - self.width/2;
                    }
                    if(self.y< self.height/2)
                    {
                        self.y =  self.height/2;
                    }
                    if( self.y > height- self.height/2){
                        self.y = height - self.height/2;
                    }

                    for(var key in wallList){
                        if(Collision(self,wallList[key]))
                        {
                            var key = wallList[key];
                            if(self.left_button && self.x > key.x)
                            {
                                self.x = key.x + key.width/2 + self.width/2 + 0.5;
                            }
                            else if(self.right_button && self.x < key.x){
                                self.x = key.x - key.width/2 - self.width/2 - 0.5;
                            }
                            else if(self.down_button && self.y < key.y)
                            {
                                self.y = key.y- key.height/2 - self.height/2 - 0.5;
                            }
                            else if(self.up_button && self.y > key.y){
                                self.y = key.y + key.height/2 + self.height/2  + 0.5 ;
                            }
                        }
                    }
                    self.atk_counter++;
                }

                player = self;
            }
           
            function enemy(new_id, new_x, new_y, new_spdx, new_spdy, new_height, new_width,new_color ){
                var self = Atk_object("enemy",new_x,new_y,new_spdx,new_spdy,new_height,new_width,new_color,new_id);

                self.attack_action = function(){
                    if(self.atk_counter >= self.atk_spd )
                        {
                        rand_bullet(self.atk_angle,self);
                        self.atk_counter = 0;
                        }
                };
                self.move = function(){
                        self.x+=self.spdx;
                        self.y+=self.spdy;
                    
                        
                            if(self.x - self.width/2 < 0 || self.x + self.width/2 > width){
                                self.spdx = -self.spdx;
                            }
                            if(self.y - self.height/2 < 0 || self.y + self.height/2 > height){
                                self.spdy = -self.spdy;
                            }
                            self.atk_counter++;
                            self.atk_angle = Math.atan2(player.y-self.y,player.x-self.x)/ Math.PI *180;
                            
                            self.attack_action();
                        
                }
                
                enemyList[new_id] = self;
            }
            

            function rand_enemy(){
                var unit_height = 15 + Math.random() * 15;
                var unit_width = 15 + Math.random() * 15;
                enemy(Math.random(),Math.random()*(width - unit_width/2),Math.random()*(height - unit_height/2), 5 + Math.random()* 5,5 + Math.random()* 5, unit_height, unit_width , "red");
            } 

            function bullet(new_id, new_x, new_y, new_spdx, new_spdy, new_height, new_width,unit ){
                var self = object("bullet",new_x,new_y,new_spdx,new_spdy,new_height,new_width,unit.color,new_id);
             
                self.atker = unit.type;
                bulletList[new_id] = self; 
                var super_update = self.update;
                self.update = function(){
                    super_update();
                    if(self.atker != "enemy"){
                         for(var lock in enemyList)
                        {
                            if(Collision(self,enemyList[lock])){
                                delete enemyList[lock];
                                delete bulletList[self.id];
                                
                                break;
                            }
                        }
                    }
                    else if (self.atker != "player"){
                        
                        if(player_hit(self))
                            delete bulletList[self.id];
                    }
                }
            }
            
            
            function rand_bullet(angle,unit){
                
                bullet(Math.random(),unit.x,unit.y, Math.cos(angle/180*Math.PI) * 10,Math.sin(angle/180*Math.PI)*10, 10,  10, unit);
            } 

            function upgrade(new_id, new_x, new_y, new_spdx, new_spdy, new_height, new_width,new_color,effect ){
                var self  = object  ("upgrade", new_x, new_y, new_spdx, new_spdy, new_height, new_width,new_color,new_id)
                self.effect = effect;
            
                upgradeList[new_id] = self;
            }

            function heal_upgrade(){
                player.hp += heal_amount;
            }

            function atk_spd_upgrade(){
                player.atk_spd -= 2.5;
            }

            function rand_upgrade(){
                upgrade(Math.random(),Math.random()*width,Math.random()*height, 0, 0, 10, 10, "orange",atk_spd_upgrade);
            } 

            function aoe_upgrade_effect(){
                var aoe ={
                    x:player.x ,
                    y:player.y ,
                    height:aoe_upgrade_distance,
                    width:aoe_upgrade_distance,
                };
                
                board.beginPath();
                board.rect(aoe.x - aoe_upgrade_distance/2 ,aoe.y - aoe_upgrade_distance/2,aoe_upgrade_distance,aoe_upgrade_distance);
                board.stroke();
                board.closePath();
                
                for(var key in enemyList)
                {
                    if(Collision(enemyList[key], aoe))
                    {
                        delete enemyList[key];
                    }
                }

                for(var key in bulletList)
                {
                    if(bulletList[key].atker == "enemy" && Collision(bulletList[key], aoe) )
                    {
                        delete bulletList[key];
                    }
                }
                
            }

            function aoe_upgrade(){
                upgrade(Math.random(),Math.random()*width,Math.random()*height, 0, 0, 10, 10, "purple",aoe_upgrade_effect);
            }