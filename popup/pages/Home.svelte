<script lang="ts">
	import { onMount } from 'svelte';
	import { _ } from 'popup/i18n';

	import TopBar from '../components/TopBar.svelte';
	import LeftNavBar from '../components/LeftNavBar.svelte';

	let loading = false;
	let leftBar = false;

  const onRefresh = async (rate = false) => {
		loading = true;
		// try {
		// 	await balanceUpdate();
		// } catch (err) {
		// 	// alert(err.message);
		// }
		// if (rate) {
		// 	try {
		// 		await updateRate();
		// 	} catch (err) {
		// 		// alert(err.message);
		// 	}
		// }
		loading = false;
	};
	const onToggleLeftBar = () => {
		leftBar = !leftBar;
	};

	onMount(async() => {
		await onRefresh();
	});
</script>


<LeftNavBar
	show={leftBar}
	on:close={onToggleLeftBar}
/>
<section>
	<TopBar
		refresh
		view
		lock
		on:refresh={() => onRefresh(true)}
	/>
	<img
		src="/imgs/logo.png"
		alt="logo"
	>
	<main>
	</main>
</section>

<style lang="scss">
	@import "../styles/mixins";
	main {
		height: calc(100vh - 86px);
		z-index: 3;

		@include flex-center-top-column;
	}
	img {
		position: fixed;
		max-width: 900px;
		width: 130vw;
		margin: 0% auto;
		left: auto;
		right: auto;
		top: -47px;
		opacity: 0.5;
	}
	section {
		background-color: var(--background-color);
		@include flex-center-top-column;
	}
</style>
