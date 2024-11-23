<?php

function testFunction($param1, $param2) {
    $param1 = "Hello";  // This $param1 should be highlighted
    $other = "World";   // This should not be highlighted
    return $param2;     // This $param2 should be highlighted
}

class TestClass {
    public function testMethod($methodParam) {
        $methodParam = 42;  // This $methodParam should be highlighted
        $local = 100;       // This should not be highlighted
        return $methodParam;  // This $methodParam should be highlighted
    }
}

function SetViewHtml($newParam1 = false, $newParam2 = ''){
    $param2 = '$param2';

    if(strlen($newParam2)) $viewAction = $newParam2;

    $h = '';
    $html = 'html';
    if($html === 'html'){
        if($h) $html = $h;
    }




    if(!$newParam1){
        $html = 'js';
    }
    return $html;
}

function View(){
    $newParam1 = false;
    $newParam2 = '';
    $html = SetViewHtml($newParam1, $newParam2);
    return $html;
}
