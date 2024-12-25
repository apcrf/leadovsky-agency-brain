<?php
//**************************************************************************************************
// Меню приложения
//**************************************************************************************************
?>

<nav class="navbar navbar-expand-lg navbar-light bg-aliceblue py-0">
	<div class="container-fluid">
		<!-- siteName -->
		<a class="navbar-brand me-0" href="/">
			<img src="/images/<?=$app->settings['appLogo']?>" style="width: 37px; height: 37px;">
			<span class="d-inline-block me-1" style="transform: translateY(1px);"><?=$app->settings['appTitle']?></span>
		</a>
		<!-- toggler -->
		<button type="button" class="navbar-toggler" onclick="navbarBtnClick(this)" title="Меню сайта">
			<span class="navbar-toggler-icon"></span>
		</button>
		<!-- collapse -->
		<div class="collapse navbar-collapse" id="collapse">

			<!-- Меню приложения -->
			<ul class="navbar-nav me-auto mb-2 mb-lg-0">
				<!--
				<li class="nav-item">
					<a class="nav-link active" href="/">Главная страница</a>
				</li>
				-->
				<?php
					// Перебор пунктов Меню приложения
					foreach ($app->menu as $item) {
						// Если пункт Меню приложения содержит подпункты
						if ( in_array($item['name'], array_column($app->routes, 'menu')) ) {
				?>
							<li class="nav-item dropdown">
								<a class="nav-link dropdown-toggle" href="#" onclick="navbarLinkClick(this)">
									<?=$item['title']?>
								</a>
								<ul class="dropdown-menu bg-aliceblue">
									<?php
										foreach ($app->routes as $route) {
											// Добавляются подпункты текущего пункта Меню приложения
											if ( $route['menu'] == $item['name'] ) {
												// Divider или Маршрут
												if ( $route['type'] == 'DIV' ) {
									?>
													<li>
														<hr class="dropdown-divider">
													</li>
									<?php
												}
												else {
									?>
													<li>
														<a class="dropdown-item ps-2" href="<?=$route['pattern']?>">
															<i class="<?=$route['icon']?> fa-lg" style="width: 28px;"></i> <?=$route['title']?>
														</a>
													</li>
									<?php
												}
											}
										}
									?>
								</ul>
							</li>
				<?php
						}
					}
				?>

			</ul>

			<!-- Меню пользователя -->
			<?php
				if ( !empty($app->authUser['name']) ) {
			?>
					<ul class="navbar-nav ms-auto mb-2 mb-lg-0">
						<li class="nav-item dropdown">
							<a class="nav-link dropdown-toggle" href="#" onclick="navbarLinkClick(this)">
								<?=$app->authUser['name']?>
							</a>
							<ul class="dropdown-menu bg-aliceblue" style="right: 0">
								<li>
									<a class="dropdown-item ps-2" href="/profile">
										<i class="fas fa-address-card fa-lg" style="width: 28px;"></i> Профайл
									</a>
								</li>
								<li><hr class="dropdown-divider"></li>
								<li>
									<a class="dropdown-item ps-2" href="/logout">
										<i class="fas fa-right-from-bracket fa-lg" style="width: 28px;"></i> Выход
									</a>
								</li>
							</ul>
						</li>
					</ul>
			<?php
				}
			?>

		</div>
	</div>
</nav>

<?php
//**************************************************************************************************
?>
