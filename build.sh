#!/bin/bash

declare -a gbulid=("client" "server")
whatuse="all"

tabel_point="client,server"

echo "Let's build :)"
gonline="no"

cekif(){
  if [[ "all" == *"$whatuse"* ]]; then
   whatuse=$tabel_point
  fi
}

bulid()
{

  cekif

  echo "Start build..."
  for i in "${gbulid[@]}";
  do 
    if [[ $whatuse == *"$i"* ]]; then

     echo "$i...."
     cd "$i" || exit;
     docker build -t "repo.volcanoyt.com/p2pcam_$i" -f Dockerfile .
     cd ..
    
     if [[ $gonline == *"yes"* ]]; then
      echo "Start push to our server"
      docker push repo.volcanoyt.com/base_"$i"
     fi

    else
     echo "Skip $i"
    fi
  done
}

tes()
{
  echo "Start Tes Mode..."
  for i in "${gbulid[@]}";
  do 
    if [[ $whatuse == *"$i"* ]]; then

     bulid

     if [[ $whatuse == *"client"* ]]; then
      docker run --rm -it  -p 3002:3000/tcp repo.volcanoyt.com/p2pcam_client:latest
     fi
     if [[ $whatuse == *"server"* ]]; then
      docker run --rm -it  -p 3001:3000/tcp repo.volcanoyt.com/p2pcam_server:latest
     fi

    else
     echo "Skip $i"
    fi
  done
}

push()
{

  cekif
  
  echo "Start push..."
  for i in "${gbulid[@]}";
  do 
    if [[ $whatuse == *"$i"* ]]; then

     echo "$i...."
     docker push repo.volcanoyt.com/p2pcam_"$i"

    else
     echo "Skip $i"
    fi
  done
}

if [ $# -eq 0 ]; then
  echo "Type build like bash run.sh bulid etc,etc,etc"
else

  tmpuse="$2"
  if [ -n "$tmpuse" ]
  then
      whatuse="$tmpuse"
  fi
  
  gonline="$3"   
  case $1 in bulid|push|tes)
    $1
    ;;
  esac
fi