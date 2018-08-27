App = {
  web3Provider: null,
  contracts: {},
  account:null,
  warcraftInstance:null,
  character:null,
  accountInterval:null,
  timerInterval:null,
  timeLeft:0,
  characterBalance:null,
  blockNumber:null,
  listening:false,
  characterCreationEvent:null,

  newRandomCharacterCost:2,

  init: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;  
      App.account = web3.eth.accounts[0];
      App.setLastBlockNumber();

      accountInterval = setInterval(function() {
        if (web3.eth.accounts[0] !== App.account) {
          App.account = web3.eth.accounts[0];
          //App.loadPage();
          location.reload();
        }
      }, 100);
      
    } else {
      $("#results").text("This website needs a web3 injecter such as MetaMask");
    } 
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },
  //Function to call each time we call a function modifying the state of our contract
  setLastBlockNumber: function(){
    web3.eth.getBlock('latest',function(error,result){
      if(!error){
        App.blockNumber = result.number;
      }
      else{
        console.log("setLastBlockNumber Error : " + error);
      }
    });
  },

  initContract: function(){
    $.getJSON('WarcraftZones.json', function(data) {
      var WarcraftArtifact = data;
      App.contracts.Warcraft = TruffleContract(WarcraftArtifact);
      App.contracts.Warcraft.setProvider(App.web3Provider);

      return App.loadWarcraft();
    });
  },

  loadWarcraft: function(){
    App.contracts.Warcraft.deployed().then(function(instance) {
      warcraftInstance = instance;
      App.loadPage();
    });
  },

  
  /* LOAD THE PAGE AND CHOOSE WHAT TO SHOW */
  loadPage: function(){
    //$("#results").text("Your Account : " + account);
    warcraftInstance.paused.call().then(function(paused){
      //console.log("paused : " + data);
      if(paused){ //paused
        $(".contract-status .status").text("Paused...");
        $(".contract-status .status").addClass("off");
      }else{ //unpaused
        $(".contract-status .status").text("Unpaused!");
        $(".contract-status .status").addClass("on");
      }
    }).catch(function(err){
      console.log(err.message);
    });
    warcraftInstance.owner.call().then(function(data) {
      if(data == App.account){
        App.displayAdmin();
      }
      else{
        warcraftInstance.getCharacters.call(App.account).then(function(data) {
        
          if(App.characterCreationEvent != null){
            App.characterCreationEvent.stopWatching();
          }
          App.characterCreationEvent = warcraftInstance.characterCreated({_address : App.account}, {
            fromBlock: App.blockNumber,
            toBlock: 'latest'
          }).watch(function(error, event) {
            if(App.blockNumber < event.blockNumber) {
              console.log("characterCreation event triggered ", event);
              $("#transactionModal").modal("hide");
              App.informationModal(3, "You have created your character!");
              App.setLastBlockNumber();
              App.displayAccount();
            }
            
          });
    
          if(data.length == 0){
            App.createAccountPage();
          }else{
            App.character = null;
            App.displayAccount();
          }
        }).catch(function(err) {
          console.log(err.message);
        });
      }
    }).catch(function(err) {
      console.log(err.message);
    });
    
  },

  /* LOAD THE ACCOUNT CREATION PAGE*/
  createAccountPage: function(){
    var results = $('#results');
    var createAccount = $('#createAccount');
    results.empty();

    results.append(createAccount.html());
    App.chooseFaction($(".faction")[0],0);
  },

  chooseFaction: function(img,nb){
    $("#inputFaction").val(nb);
    $(".faction").removeClass("on");
    img.classList.add("on");
  },

  chooseFactionBuy: function(img,nb){
    $("#buyInputFaction").val(nb);
    $(".faction").removeClass("on");
    img.classList.add("on");
  },

  createAccount: function(){
    var name = $("#inputName").val();
    var faction = $("#inputFaction").val();
    warcraftInstance.createAccount(name,parseInt(faction),{from: App.account}).then(function() {
      App.transactionModal(1,"Creating your character...");
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  displayAccount: function(){
    warcraftInstance.getCharacters.call(App.account).then(function(charList) {
      $("#results").empty();
      $(".charList").empty();
      $("#results").append($("#displayAccount").html());
      warcraftInstance.getBalanceOf.call(App.account).then(function(balance) {
        $(".userBalance .userCurrentBalance").text(balance);
        App.characterBalance = balance;
      }).catch(function(err) {
        console.log(err.message);
      });
      warcraftInstance.newRandomCharacterCost.call().then(function(cost) {
        $(".charCost").text(cost);
      }).catch(function(err) {
        console.log(err.message);
      });
      
      for(var i = 0 ; i < charList.length ; i++){
        //the first one gets automatically selected if there isn't already a selected one
        var charId;
        if(i == 0){
          if(App.character == null)
            charId = charList[i];
          else
            charId = App.character[0];
        }

        warcraftInstance.getCharacter.call(charList[i]).then(function(res) {
          
          var charList = $('.charList');
          var characterTemplate = $('#characterTemplate').clone();
          console.log("loading");
          characterTemplate.find(".characterName").text(res[1]);
          characterTemplate.find(".characterLevel").text(res[3]);
          characterTemplate.find(".characterSelect").val(res[0]);
          console.log("btn val : " + charList[i]);

          charList.append(characterTemplate.html());
        }).catch(function(err) {
          console.log(err.message);
        });

      }
      App.loadCharacter(charId);
    }).catch(function(err) {
      console.log(err.message);
    });
    
    
  },

  /* LOAD CURRENT CHARACTER */
  loadCharacter: function(id){
    console.log("loading char..");
    warcraftInstance.getCharacter.call(id).then(function(res) {
      //set the character info

      App.character = res;
      var charInfo = $('.charInfo');
      if(!App.listening){
        App.listening = true;
        App.eventListener();
      }

      charInfo.find(".charInfoName").text(res[1]);
      //charInfo.find(".charInfoDna").text(res[2]);
      charInfo.find(".charInfoLevel").text(res[3]);
      charInfo.find(".charInfoExp").text(res[4]);
      charInfo.find(".charInfoExpToLevel").text(res[5]);
      charInfo.find(".charInfoExpPercent").text(Math.round(res[4]/res[5]*100));

      if(res[2] % 10 == 1){
        charInfo.find(".factionImg").attr("src","./images/hordelogo2.png");
      }
      else{
        charInfo.find(".factionImg").attr("src","./images/alliancelogo2.png");
      }     

      $.getJSON("characters.json",function(json){
        var faction = getDnaDigit(res[2],1);
        var race = 0;
        var gender = 0;
        if(getDnaDigit(res[2],5) >= 5){
          race = 1;
        }
        if(getDnaDigit(res[2],4) >= 5){
          gender = 1;
        }
        charInfo.find(".charInfoRace").text(json[faction][race][gender].name);
        charInfo.find(".charImage").attr("src","./images/" + json[faction][race][gender].image);
      });   

      $.getJSON("classes.json",function(json){
        var classes = 0;

        classes = getDnaDigit(res[2],4) ;
        console.log("dna : "+ res[2] + " class : " + classes);
        //charInfo.find(".charInfoRace").text(json[classes].name);
        charInfo.find(".classImage").attr("src","./images/" + json[classes].image);
      });

      App.loadMap();
      //the first one gets automatically selected
      if(App.timerInterval != null)
        clearInterval(App.timerInterval);
      App.timerInterval = setInterval(function() {
        timeLeft = res[6] - parseInt($.now().toString().slice(0,-3));
        if(timeLeft > 0){
          $(".charInfo .timeLeft").text(timeLeft + " s");
        }
        else{
          $(".charInfo .timeLeft").text("Ready!");
        }
            
      }, 100);
      

    }).catch(function(err) {
      console.log(err.message);
    });
  },

  loadMap: function(){
    warcraftInstance.getZoneCount.call().then(function(res) {
    console.log("loading map ...");
      //:eq(0) to assure idt doesn't also copy to the template.
      var questMap = $(".questMap:eq(0)");
      questMap.empty();
      questMap.append("<img/>");
      App.selectZone();
      for(var i = 0 ; i < res ; i++){
        warcraftInstance.getZone.call(i).then(function(zone) {
          var zoneTemplate = $("#zoneTemplate").clone();
          zoneTemplate.find(".zoneName").text(zone[1]);
          zoneTemplate.find(".zoneLevel").text(zone[2]);
          zoneTemplate.find(".zoneSuccessRate").text(zone[3]);
          zoneTemplate.find(".zoneExp").text(zone[4]);
          zoneTemplate.find(".zoneCurrencyReward").text(zone[6]);

          //if Zone level is inferior to character level
          if(parseInt(zone[2]) <= parseInt(App.character[3])){
            zoneTemplate.find(".zoneSelect").addClass("btn-success");
            zoneTemplate.find(".zoneSelect").val(zone[0]);
          }
          else{
            zoneTemplate.find(".zoneSelect").removeClass("btn-success");
            zoneTemplate.find(".zoneSelect").addClass("btn-warning");
            zoneTemplate.find(".zoneSelect").prop("disabled",true);
          }
          if(zone[5] == 0){
            zoneTemplate.find(".zone").addClass("kalimdor");
          }
          else{
            zoneTemplate.find(".zone").addClass("eastern-kingdom");
            zoneTemplate.find(".zone").addClass("hide");
          }
          // To be able to specify the zone in CSS ;)
          zoneTemplate.find(".zone").addClass("zone-"+zone[0]);

          questMap.append(zoneTemplate.html());


        }).catch(function(err) {
          console.log(err.message);
        });
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },
  selectZone:function(){
    var select = $( "#continentSelect option:selected" ).val();
    if(select == 1){
      $(".questMap:eq(0) img").attr("src","./images/parchmentAlliance.png");
      $(".eastern-kingdom").removeClass("hide");
      $(".kalimdor").addClass("hide");
    }
    else{
      $(".questMap:eq(0) img").attr("src","./images/parchmentHorde.png");
      $(".eastern-kingdom").addClass("hide");
      $(".kalimdor").removeClass("hide");
    }
  },


  questInZone: function(button){
    //checks if the character is ready
    if(timeLeft > 0){
      App.informationModal(2,"You can't do dat mon!");
    }
    else{
      var zoneId = button.value;
      //alert("zone : " + zoneId + " charID : " + character[0]);
      warcraftInstance.questing(App.character[0],zoneId).then(function(res) {
        App.transactionModal(0,"Currenty questing...");
        
      }).catch(function(err) {
        console.log(err.message);
      });
    }
  },
  
  buyNewCharacter:function(){
    if(App.characterBalance<App.newRandomCharacterCost){
      App.informationModal(2,"Not enough money for that!");
      $('#buyNewCharacterModal').modal('hide');
    }
    else{
      var faction = $("#buyInputFaction").val();
      var name = $("#buyInputName").val();
      warcraftInstance.createNewRandomCharacter(name,parseInt(faction),{from: App.account}).then(function() {
        $('#buyNewCharacterModal').modal('hide');
        App.transactionModal(1,"Creating character...");
        //App.loadPage();
      }).catch(function(err) {
        console.log(err.message);
      });
    }
    
  },

  informationModal:function(type,info){
    var modal = $("#infoModal");
    modal.find(".information-text").text("");
    
    var image = modal.find(".information-image");
    if(type==0){          //victory
      image.attr("src","./images/victory.png");
    }
    else if(type == 1){   // defeat
      image.attr("src","./images/defeat.png");
    }
    else if(type == 2){                 // warning
      image.attr("src","./images/warning.png");
      modal.find(".information-text").text(info);
    } else{
      image.attr("src","./images/announcement.png");
      modal.find(".information-text").text(info);
    }
    modal.modal('show');
  },

  transactionModal:function(type,info){
    var modal = $("#transactionModal");
    modal.find(".transactionModal-text").text("");
    
    var image = modal.find(".transactionModal-image");
    if(type==0){          //questing
      image.attr("src","./images/wow_battle.jpg");
      modal.find(".transactionModal-text").text(info);
    }
    else{
      image.attr("src","./images/character-creation.png");
      modal.find(".transactionModal-text").text(info);
    }
    modal.modal('show');
  },

  eventListener:function(){
    console.log("charId : " + App.character[0])
    //
    warcraftInstance.questDone({_charId : App.character[0]}, {
      fromBlock: App.blockNumber,
      toBlock: 'latest'
    }).watch(function(error, event) {
      if(App.blockNumber < event.blockNumber) {
        console.log("questDone event triggered ", event);
        var result = event.args._success;
        App.setLastBlockNumber();

        if(result == true){
          $("#transactionModal").modal('hide');
          App.informationModal(0);
        }
        else{
          $("#transactionModal").modal('hide');
          App.informationModal(1);
        }
        App.displayAccount();
      }
      
    });
  },
  characterCreationEventListener:function(){
    warcraftInstance.characterCreated({_address : App.account}, {
      fromBlock: App.blockNumber,
      toBlock: 'latest'
    }).watch(function(error, event) {
      if(App.blockNumber < event.blockNumber) {
        console.log("characterCreation event triggered ", event);
        
        $("#transactionModal").modal('hide');
        App.informationModal(3, "You have created your character!");
        App.setLastBlockNumber();
        App.displayAccount();
      }
      
    });
  },

// -------------- ADMIN ZONE ----------------

  displayAdmin:function(){
    $("#results").empty();
    $("#results").append($("#adminPage").html());
    var admin = $(".admin:eq(0)");
    warcraftInstance.balanceOf.call(App.account).then(function(balance){
      admin.find(".adminInfo-tokens").text(balance);
    }).catch(function(err) {
      console.log(err.message);
    });
    warcraftInstance.zoneDowntime.call().then(function(downtime){
      admin.find(".adminInfo-downtime").text(downtime);
    }).catch(function(err) {
      console.log(err.message);
    });
    warcraftInstance.newRandomCharacterCost.call().then(function(cost){
      admin.find(".adminInfo-cost").text(cost);
    }).catch(function(err) {
      console.log(err.message);
    });
    warcraftInstance.getCharacterCount.call().then(function(characters){
      console.log(characters);
      admin.find(".adminInfo-characters").text(characters);
    }).catch(function(err) {  
      console.log(err.message);
    });
    warcraftInstance.getZoneCount.call().then(function(zones){
      console.log(zones);
      admin.find(".adminInfo-zones").text(zones);
    }).catch(function(err) {  
      console.log(err.message);
    });
    warcraftInstance.paused.call().then(function(paused){
      admin.find(".ispaused").text(paused);
      if(!paused){
        admin.find(".unpause").prop("disabled",true);
      }
      else{
        admin.find(".pause").prop("disabled",true);
      }
    }).catch(function(err){
      console.log(err.message);
    });

  },

  pauseGame:function(){
    warcraftInstance.pause().then(function(){
      App.informationModal(2, "Game is now paused");
      $(".admin:eq(0)").find(".unpause").prop("disabled",false);
      $(".admin:eq(0)").find(".pause").prop("disabled",true);
    }).catch(function(err){
      console.log(err.message);
    });
  },

  unpauseGame:function(){
    warcraftInstance.unpause().then(function(){
      
      App.informationModal(2, "Game is no longer paused");
      $(".admin:eq(0)").find(".pause").prop("disabled",false);
      $(".admin:eq(0)").find(".unpause").prop("disabled",true);
    }).catch(function(err){
      console.log(err.message);
    });
  },

  createNewZone:function(){
    var admin = $(".admin:eq(0)");
    var name = admin.find("#inputNewZoneName").val(); 
    var lvl = admin.find("#inputNewZoneLvl").val(); 
    var successRate = admin.find("#inputNewZoneSuccessRate").val(); 
    var exp = admin.find("#inputNewZoneExp").val(); 
    var continent = admin.find("#inputNewZoneContinent").val(); 
    var reward = admin.find("#inputNewZoneReward").val(); 

    warcraftInstance.addNewZone(name,parseInt(lvl),parseInt(successRate),parseInt(exp),
    parseInt(continent),parseInt(reward),{from: App.account}).then(function(){
      alert("successfully added");
    }).catch(function(err){
      console.log(err.message);
    });

  },
  changeRandomCharacterCost :function(){
    var admin = $(".admin:eq(0)");
    var newValue = admin.find("#inputNewCharacterCost").val(); 

    warcraftInstance.changeNewRandomCharacterCost(newValue,{from: App.account}).then(function(){
      //alert("successfully changed");
      App.informationModal(3, "The cost of a new random character is now : " + newValue);
    }).catch(function(err){
      console.log(err.message);
    });

  },
  changeZoneDowntime :function(){
    var admin = $(".admin:eq(0)");
    var newValue = admin.find("#inputZoneDowntime").val(); 

    warcraftInstance.changeZoneDowntime(newValue,{from: App.account}).then(function(){
      //alert("successfully changed");
      App.informationModal(3, "The zone downtime is now : " + newValue);
    }).catch(function(err){
      console.log(err.message);
    });

  }


  

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});


function getDnaDigit(dna,digit){
  dna = parseInt(dna);
  digit = parseInt(digit);
  return (     (   (dna% Math.pow(10,digit)) - (dna% Math.pow(10,(digit-1)))   )    /    Math.pow(10,(digit-1))          );
}
