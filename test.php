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
