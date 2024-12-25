
<div class="container">

    <div class="row mt-4">
        <div class="col-12">
            <b>HTTP-server version:</b> <?=$_SERVER["SERVER_SOFTWARE"]?>
        </div>
    </div>
    <div class="row mt-1">
        <div class="col-12">
            <b>PHP version:</b> <?=phpversion()?>
        </div>
    </div>
    <div class="row mt-1">
        <div class="col-12">
            <b>MySQL version:</b> <?=$app->query("SELECT VERSION() AS Version")[0]['Version']?>
        </div>
    </div>
    <div class="row mt-1">
        <div class="col-12">
            <b>App version:</b> <?=$app->version?>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-12">
            <b>Bootstrap</b>
        </div>
        <div class="col-12">
            <?php
                $filename = 'css/bootstrap/bootstrap.css';
                $lines = file($filename);
                for ( $i=1; $i<6; $i++ ) {
                    echo $lines[$i] . '<br>';
                }
            ?>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-12">
            <b>FontAwesome</b>
        </div>
        <div class="col-12">
            <?php
                $filename = 'css/fontawesome/css/all.css';
                $lines = file($filename);
                for ( $i=0; $i<5; $i++ ) {
                    echo $lines[$i] . '<br>';
                }
            ?>
        </div>
    </div>

    <div class="row mt-4">
        <div class="col-12">
            <b>$_SERVER</b>
        </div>
        <div class="col-12">
            <table class="table">
                <?php
                    foreach ( $_SERVER as $k=>$v ) {
                        //if ( in_array($k, ['PATH']) ) continue;
                ?>
                        <tr>
                            <td><?=$k?></td>
                            <td class="text-break"><?=$_SERVER[$k]?></td>
                        </tr>
                <?php
                    }
                ?>
            </table>
        </div>
    </div>

</div> <!-- /container -->

<br><br>
<?php
	//phpinfo(INFO_MODULES);
?>
