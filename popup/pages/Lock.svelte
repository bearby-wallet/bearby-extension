<script lang="ts">
  import { tick, onMount } from 'svelte';
	import { push } from 'svelte-spa-router';
	import { _ } from 'popup/i18n';
	import { linksExpand } from 'popup/mixins/link';
	import { unlockWallet } from 'popup/backend/wallet';


	let inputEl: HTMLInputElement | undefined;
	let password = '';
	let error = '';
	let loading = false;

	$: disabled = loading || !password;

	onMount(() => {
    if (inputEl && inputEl.focus) {
      inputEl.focus();
    }
  });

	const handleInput = () => {
		error = '';
	};
	const handleBlur = async () => {
    await tick();
		
    if (inputEl && inputEl.focus) {
      inputEl.focus();
    }
  };

	const handleSubmit = async (e: Event) => {
		e.preventDefault();

		try {
			loading = true;
			const state = await unlockWallet(password);

			if (state.guard.isEnable && state.guard.isReady) {
				loading = false;
				push('/');
			}
		} catch (err) {
			error = `${$_('lock.error')}-(${(err as Error).message})`;
		}
		loading = false;
	}
</script>

<main>
	<img
		src="/imgs/logo.webp"
		alt="logo"
	>
	<h1>
		{$_('lock.title')}
	</h1>
	<form on:submit={handleSubmit}>
		<label>
			<input
				bind:this={inputEl}
				bind:value={password}
				class:error={Boolean(error)}
				type="password"
				autocomplete="off"
				placeholder={$_('lock.placeholder')}
				required
				on:blur={handleBlur}
				on:input={handleInput}
			>
		</label>
		<button
			class="outline"
			class:loading={loading}
			disabled={Boolean(disabled || error)}
		>
			{$_('lock.btn')}
		</button>
		<span on:mousedown={() => linksExpand('/start')}>
			{$_('lock.restore')}
		</span>
	</form>
</main>

<style lang="scss">
	@import "../styles/mixins";

	h1 {
		color: var(--text-color);
		@include fluid-font(320px, 1024px, 32px, 55px);
	}
	span {
		cursor: pointer;
		margin-block-start: 16px;
		font-size: 12px;
		color: var(--muted-color);

		&:hover {
			color: var(--primary-color);
		}
	}
	img {
		max-width: 500px;
    width: calc(100vw - 90px);
	}
	main {
		background: inherit;
		height: 100vh;

		@include flex-center-column;
	}
	label {
		width: inherit;
		& > input.error {
			outline-color: var(--danger-color);
			animation: shake .4s linear;
		}
	}
	button {
		margin-top: 12px;
	}
	form {
		width: 290px;
		@include flex-center-column;
	}
</style>
