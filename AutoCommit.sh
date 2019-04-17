#!/bin/bash
BLACK="\033[30m"
RED="\033[31m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
PINK="\033[35m"
CYAN="\033[36m"
WHITE="\033[37m"
NORMAL="\033[0;39m"

echo -e "${YELLOW}WELCOME TO AUTOCOMMIT !!!!!!!!!!!!!!!!!! ${NORMAL}" &&
git status && git add . && git status && echo -e "${YELLOW}Enter Your Commit Message ${NORMAL}" &&
read msg
git commit -m "${msg}"
echo -e "${RED}Would you like to Force This y/n? ${NORMAL}"

read rsp

if [ $rsp = "y" ]; then
	git push origin master -f
else
	echo -e  "${RED}Alright no problem ${NORMAL}" && git push origin master
fi

